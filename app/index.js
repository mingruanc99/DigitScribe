import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';

export default function Landing() {
  const router = useRouter();
  const segments = useSegments();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Wait for router to be ready and prevent duplicate navigation
    if (!hasNavigated && router.isReady) {
      const currentPath = segments.join('/');

      // Only navigate if we're still at the root (not already at tabs)
      if (currentPath === '' || currentPath === 'index') {
        try {
          router.replace('/(tabs)');
          setHasNavigated(true);
        } catch (error) {
          console.log('Navigation error:', error.message);
        }
      }
    }
  }, [router.isReady, hasNavigated, segments]);

  return null;
}
