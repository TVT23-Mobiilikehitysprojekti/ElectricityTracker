import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const useRateLimitedTask = (key, interval = 3 * 60 * 60 * 1000) => {
  const [isReady, setIsReady] = useState(false);

  const canExecute = useCallback(async () => {
    const lastExecuted = await AsyncStorage.getItem(key);
    const now = Date.now();
    if (!lastExecuted || now - parseInt(lastExecuted) > interval) {
      await AsyncStorage.setItem(key, now.toString());
      setIsReady(true);
      return true;
    }
    setIsReady(false);
    return false;
  }, [key, interval]);

  const executeTask = useCallback(async (url) => {
    const allowed = await canExecute();
    if (allowed) {
      try {
        const response = await axios.get(url);
        console.log('Response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error during GET request:', error);
      }
    } else {
      console.log('Task execution blocked due to rate limiter.');
    }
  }, [canExecute]);

  return { executeTask, isReady };
};

export default useRateLimitedTask;
