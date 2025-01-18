import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const verifyProfile = async (userId: string): Promise<boolean> => {
  try {
    logger.info("Starting profile verification", { userId });
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, name, terms_accepted')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      logger.error("Profile verification error", { error, userId });
      return false;
    }
    
    const isValid = !!data && !!data.nickname && !!data.name && data.terms_accepted === true;
    logger.info("Profile verification completed", { 
      userId,
      isValid,
      hasData: !!data,
      hasNickname: !!data?.nickname,
      hasName: !!data?.name,
      termsAccepted: data?.terms_accepted
    });
    
    return isValid;
  } catch (error) {
    logger.error("Profile verification failed", { error, userId });
    return false;
  }
};

export const waitForProfileCreation = async (
  userId: string,
  maxAttempts: number = 10,
  delayBetweenAttempts: number = 5000, // 5 seconds
  maxWaitTime: number = 60000 // 60 seconds
): Promise<boolean> => {
  const startTime = Date.now();
  let attempts = 0;
  
  logger.info("Starting profile creation verification", {
    userId,
    maxAttempts,
    delayBetweenAttempts,
    maxWaitTime
  });
  
  while (Date.now() - startTime < maxWaitTime && attempts < maxAttempts) {
    attempts++;
    logger.info("Profile verification attempt", { 
      attempt: attempts,
      maxAttempts,
      timeElapsed: Date.now() - startTime,
      maxWaitTime
    });
    
    const profileCreated = await verifyProfile(userId);
    if (profileCreated) {
      logger.info("Profile verified successfully", { 
        userId,
        attempts,
        timeElapsed: Date.now() - startTime 
      });
      return true;
    }
    
    if (attempts < maxAttempts) {
      logger.info("Profile not verified yet", {
        userId,
        nextAttemptIn: delayBetweenAttempts,
        attemptsRemaining: maxAttempts - attempts
      });
      await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
    }
  }
  
  logger.error("Profile creation verification timeout", {
    userId,
    attempts,
    timeElapsed: Date.now() - startTime,
    maxAttempts,
    maxWaitTime
  });
  return false;
};