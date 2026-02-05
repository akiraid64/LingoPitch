-- Enable RLS on calls
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own calls
CREATE POLICY "Users can view their own calls" ON calls FOR
SELECT USING (auth.uid () = user_id);

-- Enable RLS on call_scores
ALTER TABLE call_scores ENABLE ROW LEVEL SECURITY;

-- Allow users to view scores for their own calls
-- Since call_scores doesn't have user_id, we join with calls
CREATE POLICY "Users can view their own call scores" ON call_scores FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM calls
            WHERE
                calls.id = call_scores.call_id
                AND calls.user_id = auth.uid ()
        )
    );