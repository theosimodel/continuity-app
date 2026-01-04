-- Add attribution columns for forked/saved lists
-- Supports "Saved from [Original Curator]" display

ALTER TABLE lists
ADD COLUMN forked_from_list_id UUID REFERENCES lists(id) ON DELETE SET NULL,
ADD COLUMN original_curator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN original_curator_username TEXT;

-- Index for looking up forks of a list (optional, for future features)
CREATE INDEX idx_lists_forked_from ON lists(forked_from_list_id) WHERE forked_from_list_id IS NOT NULL;

COMMENT ON COLUMN lists.forked_from_list_id IS 'Reference to the original list this was forked from';
COMMENT ON COLUMN lists.original_curator_id IS 'User ID of the original curator';
COMMENT ON COLUMN lists.original_curator_username IS 'Denormalized username for display without joins';
