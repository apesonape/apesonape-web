-- ============================================
-- FIX: Add missing is_read column to gamify_notifications
-- ============================================

-- Add is_read column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'gamify_notifications' 
    AND column_name = 'is_read'
  ) THEN
    ALTER TABLE public.gamify_notifications 
    ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT false;
    
    RAISE NOTICE 'Added is_read column to gamify_notifications table';
  ELSE
    RAISE NOTICE 'is_read column already exists';
  END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'gamify_notifications'
ORDER BY ordinal_position;

