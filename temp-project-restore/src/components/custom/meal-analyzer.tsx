'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MealAnalysis } from '@/lib/types';

interface MealAnalyzerProps {
  onAnalysisComplete: (analysis: MealAnalysis, imageUrl: string, mealType: string) => void;
}

export function MealAnalyzer({ onAnalysisComplete }: MealAnalyzerProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mealType, setMealType] = useState<string>('lunch');

  const analyzeImage = async (imageFile: File) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      // Converter imagem para base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      await new Promise((resolve) => {
        reader.onload = resolve;
      });

      const base64Image = reader.result as string;
      setSelectedImage(base64Image);

      // Chamar API de análise
      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: base64Image,
          mealType 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao analisar a imagem');
      }

      // SOLUÇÃO: Usar sessionStorage em vez de URL para evitar "Request Entity Too Large"
      sessionStorage.setItem('mealReviewImage', base64Image);
      sessionStorage.setItem('mealReviewAnalysis', JSON.stringify(data));
      sessionStorage.setItem('mealReviewType', mealType);
      
      // Redirecionar para tela de revisão
      router.push('/dashboard/review-meal');
      
      // Resetar após sucesso
      setSelectedImage(null);
    } catch (err) {
      console.error('Erro na análise:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao analisar a imagem';
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione uma imagem válida');
        return;
      }
      
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }
      
      analyzeImage(file);
    }
  };

  return (
    <Card className="border-0 bg-[#1f1b2e]/80 backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white">Analisar Refeição</div>
            <div className="text-xs sm:text-sm font-normal text-gray-400 mt-1">
              Tire uma foto ou faça upload da sua refeição
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Tipo de Refeição</label>
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger className="border-0 bg-white/5 hover:bg-white/10 transition-colors duration-200 text-white rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-0 bg-[#1f1b2e] rounded-xl">
              <SelectItem value="breakfast" className="hover:bg-white/10 transition-colors duration-150 text-white rounded-lg">Café da Manhã</SelectItem>
              <SelectItem value="lunch" className="hover:bg-white/10 transition-colors duration-150 text-white rounded-lg">Almoço</SelectItem>
              <SelectItem value="dinner" className="hover:bg-white/10 transition-colors duration-150 text-white rounded-lg">Jantar</SelectItem>
              <SelectItem value="snack" className="hover:bg-white/10 transition-colors duration-150 text-white rounded-lg">Lanche</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive" className="border-0 bg-rose-500/10 backdrop-blur-sm animate-in fade-in-50 duration-200 rounded-2xl">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <AlertDescription className="text-rose-300">{error}</AlertDescription>
          </Alert>
        )}

        {selectedImage && (
          <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-white/10 animate-in fade-in-50 zoom-in-95 duration-300 shadow-lg">
            <img 
              src={selectedImage} 
              alt="Refeição selecionada" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg rounded-xl font-semibold"
            disabled={isAnalyzing}
            onClick={() => document.getElementById('camera-input')?.click()}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Tirar Foto
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="flex-1 border-0 bg-white/5 hover:bg-white/10 text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] rounded-xl font-semibold"
            disabled={isAnalyzing}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Fazer Upload
          </Button>
        </div>

        <input
          id="camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />
        <input
          id="file-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </CardContent>
    </Card>
  );
}
