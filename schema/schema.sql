-- Create Decks table
CREATE TABLE IF NOT EXISTS Deck (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Flashcards table
CREATE TABLE IF NOT EXISTS Flashcard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    english_word TEXT NOT NULL,
    vietnamese_word TEXT NOT NULL,
    part_of_speech TEXT NOT NULL CHECK (part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'interjection', 'other')),
    example TEXT,
    memory_status SMALLINT NOT NULL DEFAULT 0 CHECK (memory_status >= 0 AND memory_status <= 3),
    deck_id UUID NOT NULL REFERENCES Deck(id) ON DELETE CASCADE,
    last_reviewed TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Study Sessions table
CREATE TABLE IF NOT EXISTS StudySession (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES Deck(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_count INTEGER NOT NULL,
    correct_count INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at column automatically
CREATE TRIGGER update_deck_updated_at
BEFORE UPDATE ON Deck
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_updated_at
BEFORE UPDATE ON Flashcard
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_flashcard_deck_id ON Flashcard(deck_id);
CREATE INDEX idx_flashcard_memory_status ON Flashcard(memory_status);
CREATE INDEX idx_flashcard_last_reviewed ON Flashcard(last_reviewed);
CREATE INDEX idx_study_session_deck_id ON StudySession(deck_id);
CREATE INDEX idx_deck_user_id ON Deck(user_id);
CREATE INDEX idx_study_session_user_id ON StudySession(user_id);

-- Enable Row Level Security
ALTER TABLE Deck ENABLE ROW LEVEL SECURITY;
ALTER TABLE Flashcard ENABLE ROW LEVEL SECURITY;
ALTER TABLE StudySession ENABLE ROW LEVEL SECURITY;

-- Create policies for Deck table
CREATE POLICY "Users can view their own or public decks" ON Deck
FOR SELECT
USING (
  is_public = TRUE OR auth.uid() = user_id
);
    
CREATE POLICY "Users can insert their own decks" ON Deck
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own decks" ON Deck
    FOR UPDATE USING (auth.uid() = user_id);
    
CREATE POLICY "Users can delete their own decks" ON Deck
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for Flashcard table
CREATE POLICY "Users can view flashcards in their decks" ON Flashcard
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM Deck WHERE Deck.id = Flashcard.deck_id AND Deck.user_id = auth.uid()
    ));
    
CREATE POLICY "Users can insert flashcards to their decks" ON Flashcard
    FOR INSERT WITH CHECK (EXISTS (
        SELECT 1 FROM Deck WHERE Deck.id = Flashcard.deck_id AND Deck.user_id = auth.uid()
    ));
    
CREATE POLICY "Users can update flashcards in their decks" ON Flashcard
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM Deck WHERE Deck.id = Flashcard.deck_id AND Deck.user_id = auth.uid()
    ));
    
CREATE POLICY "Users can delete flashcards in their decks" ON Flashcard
    FOR DELETE USING (EXISTS (
        SELECT 1 FROM Deck WHERE Deck.id = Flashcard.deck_id AND Deck.user_id = auth.uid()
    ));

-- Create policies for StudySession table
CREATE POLICY "Users can view their own study sessions" ON StudySession
    FOR SELECT USING (auth.uid() = user_id);
    
CREATE POLICY "Users can insert their own study sessions" ON StudySession
    FOR INSERT WITH CHECK (auth.uid() = user_id);
    
CREATE POLICY "Users can update their own study sessions" ON StudySession
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RPC function for deleting deck with auth check
CREATE OR REPLACE FUNCTION delete_deck_and_flashcards(deck_id uuid)
RETURNS void AS $$
BEGIN
  -- Check if user owns the deck
  IF NOT EXISTS (SELECT 1 FROM deck WHERE id = deck_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to delete this deck';
  END IF;
  
  DELETE FROM flashcards WHERE deck_id = delete_deck_and_flashcards.deck_id;
  DELETE FROM deck WHERE id = delete_deck_and_flashcards.deck_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;