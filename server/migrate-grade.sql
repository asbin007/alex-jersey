-- Add grade columns to Products table
ALTER TABLE "Products"
ADD COLUMN IF NOT EXISTS "grade" VARCHAR(1) CHECK (grade IN ('A', 'B')) NULL,
ADD COLUMN IF NOT EXISTS "gradeDescription" TEXT NULL;

-- Create enum type for grade
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'grade_enum') THEN
      CREATE TYPE grade_enum AS ENUM ('A', 'B');
   END IF;
END $$;

-- Convert grade column to use the enum type
ALTER TABLE "Products"
ALTER COLUMN "grade" TYPE grade_enum
USING CASE
  WHEN "grade" = 'A' THEN 'A'::grade_enum
  WHEN "grade" = 'B' THEN 'B'::grade_enum
  ELSE NULL::grade_enum
END;

-- Add comment explaining the grade system
COMMENT ON COLUMN "Products"."grade" IS 'Grade of the jersey: A (Premium quality) or B (Slight defects/irregularities)';