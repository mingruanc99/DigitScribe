import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';

export default function Landing() {
  const router = useRouter();
  const segments = useSegments();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (!hasNavigated && router.isReady) {
      const currentPath = segments.join('/');
      if (currentPath === '' || currentPath === 'index') {
        router.replace('/(tabs)');
        setHasNavigated(true);
      }
    }
  }, [router.isReady, hasNavigated, segments]);

  return null;
}
