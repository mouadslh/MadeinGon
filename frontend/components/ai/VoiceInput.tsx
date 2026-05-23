"use client";

import { useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export interface VoiceFillResult {
  title_fr?: string;
  title_ar?: string;
  description_fr?: string;
  description_ar?: string;
  price?: number;
  category_id?: number;
  keywords?: string[];
  transcript?: string;
}

interface VoiceInputProps {
  onFill: (data: VoiceFillResult) => void;
}

export function VoiceInput({ onFill }: VoiceInputProps) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadAudio(blob);
      };
      mediaRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      alert("Microphone non disponible");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const uploadAudio = async (blob: Blob) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      const { data } = await api.post("/ai/voice/product-fill", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTranscript(data.transcript || "");
      onFill(data);
    } catch {
      alert("Erreur transcription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 card-surface">
      <button
        type="button"
        onClick={recording ? stopRecording : startRecording}
        disabled={loading}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          recording ? "bg-[var(--color-danger)] animate-pulse" : "bg-ochre hover:bg-terracotta"
        } text-white`}
        aria-label={recording ? "Arrêter" : "Enregistrer"}
      >
        {recording ? <Square className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
      </button>
      {recording && <p className="text-sm text-ochre">Enregistrement en cours...</p>}
      {transcript && (
        <p className="text-sm text-night/80 max-w-md text-center border-t border-dune pt-4">{transcript}</p>
      )}
      {transcript && !loading && (
        <Button variant="secondary" onClick={() => onFill({ transcript })}>
          Remplir le formulaire
        </Button>
      )}
    </div>
  );
}
