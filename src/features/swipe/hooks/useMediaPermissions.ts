import { useCallback, useState } from 'react';

import { requestPermissions } from '@/services/media/MediaLibrary';

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
