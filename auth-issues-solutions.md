# Giải pháp cho vấn đề xác thực với Google & Supabase

## Các vấn đề hiện tại

1. **Không nhất quán trong cách xử lý callback**
2. **Bất đồng bộ giữa các phương pháp bảo vệ route**
3. **Logic middleware bị comment không hoàn toàn**
4. **Xử lý session không nhất quán**
5. **Quản lý cookie và session phức tạp**

## Các giải pháp đề xuất

### 1. Thống nhất xử lý OAuth callback

**Vấn đề:** File `src/app/auth/callback/page.tsx` bị comment hết logic xử lý, trong khi file API route `src/app/api/auth/callback/route.ts` đang xử lý OAuth callback.

**Giải pháp:**

- Chọn một phương pháp xử lý nhất quán: hoặc sử dụng API Route hoặc sử dụng Client Component.
- Nếu sử dụng API Route (khuyến nghị):

  ```typescript
  // Trong src/app/api/auth/callback/route.ts
  export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // Lấy đường dẫn chuyển hướng từ param "next" nếu có
    let next = searchParams.get("next") ?? "/";
    if (!next.startsWith("/")) {
      next = "/";
    }

    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        // Chuyển hướng đến trang chủ hoặc trang được yêu cầu sau khi đăng nhập thành công
        return NextResponse.redirect(`${origin}${next}`);
      }
    }

    // Nếu có lỗi, chuyển hướng đến trang lỗi
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }
  ```

### 2. Thống nhất cơ chế bảo vệ route

**Vấn đề:** Có hai cơ chế bảo vệ route chạy song song: client-side (AuthProvider) và server-side (middleware).

**Giải pháp:**

- Sử dụng middleware cho bảo vệ route (hiệu quả hơn vì xử lý ở server-side)
- Loại bỏ logic bảo vệ route khỏi AuthProvider, chỉ sử dụng AuthProvider cho việc cung cấp thông tin user

```typescript
// Trong src/components/auth/AuthProvider.tsx
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 3. Làm rõ logic middleware

**Vấn đề:** Middleware có logic phức tạp và một số phần bị comment.

**Giải pháp:**

- Đơn giản hóa middleware để xử lý chức năng chính: bảo vệ route và quản lý session
- Sửa lại phần xử lý cookie để tuân theo các phương pháp hiện đại nhất của Supabase SSR

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // Tạo response ban đầu
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Tạo supabase middleware client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    }
  );

  // Refresh session
  await supabase.auth.getSession();

  // Kiểm tra xác thực
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Xử lý protected routes
  const isProtectedPath = protectedPaths.some((route) =>
    path.startsWith(route)
  );
  if (isProtectedPath && !user) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("next", path); // Sử dụng "next" cho nhất quán
    return NextResponse.redirect(redirectUrl);
  }

  // Xử lý auth routes - redirect đến trang chủ nếu đã đăng nhập
  const isAuthPath = authPaths.some((route) => path === route);
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
```

### 4. Thống nhất xử lý session

**Vấn đề:** Xử lý session không nhất quán giữa các phương pháp đăng nhập khác nhau.

**Giải pháp:**

- Thống nhất phương pháp chuyển hướng sau đăng nhập
- Sử dụng tham số `redirectTo` nhất quán khi đăng nhập với Google OAuth

```typescript
// Trong src/app/auth/login/page.tsx
const handleGoogleLogin = async () => {
  try {
    const redirectUrl = new URL("/api/auth/callback", window.location.origin);
    // Thêm tham số next để lưu trang sẽ chuyển đến sau khi đăng nhập
    const redirectedFrom = searchParams.get("next") || "/";
    redirectUrl.searchParams.set("next", redirectedFrom);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  } catch (error: any) {
    console.error("Error logging in with Google:", error.message);
    showToast(error.message, "error");
  }
};
```

### 5. Quản lý cookie đúng cách

**Vấn đề:** Logic xử lý cookie phức tạp và có thể gây ra vấn đề với duy trì session.

**Giải pháp:**

- Sử dụng API mới nhất của Supabase cho quản lý cookie trong SSR
- Đảm bảo cookie được set đúng cách trong middleware và API routes

```typescript
// Trong các API routes khi cần tạo client
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name) {
        return cookies().get(name)?.value;
      },
      set(name, value, options) {
        cookies().set(name, value, options);
      },
      remove(name, options) {
        cookies().set(name, "", { ...options, maxAge: 0 });
      },
    },
  }
);
```

## Lưu ý quan trọng

1. **Cấu hình Supabase Auth**: Đảm bảo URL Callback trong Supabase Dashboard được cấu hình chính xác là `[your-domain]/api/auth/callback`

2. **Xử lý tham số chuyển hướng**: Đảm bảo sử dụng tên tham số nhất quán (nên dùng `next` thay vì `redirectedFrom`) và kiểm tra tính hợp lệ của URL chuyển hướng để tránh lỗi bảo mật

3. **Quản lý session**: Sử dụng phương pháp onAuthStateChange của Supabase Client để đồng bộ trạng thái người dùng trong AuthProvider

4. **Error handling**: Thêm xử lý lỗi đầy đủ và hiển thị thông báo lỗi rõ ràng cho người dùng

5. **Testing**: Kiểm tra tất cả các luồng xác thực:
   - Đăng nhập bằng email/password
   - Đăng nhập bằng Google OAuth
   - Đăng xuất
   - Quên mật khẩu
   - Truy cập trang được bảo vệ khi chưa đăng nhập
   - Truy cập trang đăng nhập/đăng ký khi đã đăng nhập
