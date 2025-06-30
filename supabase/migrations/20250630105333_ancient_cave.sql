/*
  # Update loan agreements constraint to include loan_closure

  1. Changes
    - Drop existing check constraint for agreement_type
    - Add new check constraint that includes 'loan_closure' as valid agreement type

  2. Security
    - No changes to RLS policies needed
*/

-- Drop the existing constraint
ALTER TABLE loan_agreements DROP CONSTRAINT IF EXISTS loan_agreements_agreement_type_check;

-- Add the updated constraint with loan_closure included
ALTER TABLE loan_agreements ADD CONSTRAINT loan_agreements_agreement_type_check 
  CHECK (agreement_type = ANY (ARRAY['loan_request'::text, 'sanction_letter'::text, 'lending_proof'::text, 'loan_closure'::text]));