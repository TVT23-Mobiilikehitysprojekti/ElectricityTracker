import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useElectricityPriceWatcher() {
  const [userLimits, setUserLimits] = useState({ lowerLimit: 0.0, upperLimit: 10.0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLimits = async () => {
      try {
        setIsLoading(true);
        const lowerLimit = await AsyncStorage.getItem('lowerLimit');
        const upperLimit = await AsyncStorage.getItem('upperLimit');

        setUserLimits({
          lowerLimit: lowerLimit ? parseFloat(lowerLimit) : 0.0,
          upperLimit: upperLimit ? parseFloat(upperLimit) : 10.0,
        });
      } catch (error) {
        console.error('Error fetching user limits:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLimits();
  }, []);

  const saveLimits = async (newLimits) => {
    try {
      const updatedLimits = { ...userLimits, ...newLimits };

      if (newLimits.lowerLimit !== undefined) {
        await AsyncStorage.setItem('lowerLimit', newLimits.lowerLimit.toString());
      }
      if (newLimits.upperLimit !== undefined) {
        await AsyncStorage.setItem('upperLimit', newLimits.upperLimit.toString());
      }

      setUserLimits(updatedLimits);
    } catch (error) {
      console.error('Error saving user limits:', error);
    }
  };

  return { userLimits, saveLimits, isLoading };
}
