// Media permission request hook used by swipe entry points.
// Exposes a simple pending flag to drive button/loader UI.

import { useCallback, useState } from 'react';

import { requestPermissions } from '@/services/media/MediaLibrary';

/**
 * Wraps media permission prompting with request-state tracking for UI feedback.
 */
export const useMediaPermissions = () => {
  const [isRequesting, setIsRequesting] = useState(false);

  const request = useCallback(async () => {
    setIsRequesting(true);
    const response = await requestPermissions();
    setIsRequesting(false);
    return response;
  }, []);

  return {
    isRequesting,
    request,
  };
};