import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import HandwritingCanvas from '../components/HandwritingCanvas';
import { recognizeHandwriting } from '../services/ServerConnection';
import { useApp } from '../contexts/AppContext';

export default function Home() {
  const router = useRouter();
  const { t, theme } = useApp();
  const [isRecognizing, setIsRecognizing] = useState(false);
  const canvasRef = useRef(null);

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };

  const handleRecognize = async () => {
    if (!canvasRef.current) {
      Alert.alert(t('error'), t('canvasNotReady'));
      return;
    }

    const canvasData = canvasRef.current.getCanvasData();

    if (!canvasData.paths || canvasData.paths.length === 0) {
      Alert.alert('Notice', t('writeSomething'));
      return;
    }

    setIsRecognizing(true);

    try {
      // Send to server for recognition
      const result = await recognizeHandwriting(canvasData);

      if (result.success) {
        // Navigate to result page with real data
        router.push({
          pathname: '/result',
          params: {
            result: JSON.stringify({
              recognizedText: result.predicted_text,
              confidence: Math.round(result.confidence * 100),
              processingTime: t('processing'),
              language: "Detected",
              wordCount: result.predicted_text.toString().length,
              originalPaths: canvasData.paths,
              bounds: canvasData.bounds,
              resultId: result.result_id
            })
          }
        });
      } else {
        Alert.alert(t('recognitionError'), result.error || t('recognitionFailed'));
      }

    } catch (error) {
      console.error('Recognition error:', error);
      Alert.alert(t('error'), t('recognitionFailed'));
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleCanvasReady = () => {
    console.log('Canvas is ready for handwriting input');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Written.ai</Text>
        <Text style={styles.subtitle}>AI-Powered Handwriting Recognition</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Handwriting Canvas Section */}
        <View style={styles.writingSection}>
          <Text style={styles.sectionTitle}>Write Here</Text>
          <Text style={styles.hintText}>Use your finger or stylus to write naturally</Text>

          <View style={styles.canvasContainer}>
            <HandwritingCanvas
              ref={canvasRef}
              onCanvasReady={handleCanvasReady}
              style={styles.canvas}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClear}
            disabled={isRecognizing}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.recognizeButton, isRecognizing && styles.buttonDisabled]}
            onPress={handleRecognize}
            disabled={isRecognizing}
            activeOpacity={0.7}
          >
            <Text style={styles.recognizeButtonText}>
              {isRecognizing ? t('processing') : t('recognize')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>{t('howToUse')}</Text>
          <Text style={styles.instructionText}>{t('step1')}</Text>
          <Text style={styles.instructionText}>{t('step2')}</Text>
          <Text style={styles.instructionText}>{t('step3')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  writingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  canvasContainer: {
    marginBottom: 0,
  },
  canvas: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  recognizeButton: {
    backgroundColor: '#000000',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  recognizeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructions: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 4,
  },
});
