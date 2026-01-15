-- Allow users to "Claim" achievements (Required for retroactive awarding)
CREATE POLICY "Users can earn achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Verify
SELECT 'Permissions Updated' as status;
