import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ImageIcon, ArrowLeft, Sparkles } from "lucide-react";

export default function DesignConcepts() {
  const [, setLocation] = useLocation();
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageMode, setImageMode] = useState<"basic" | "pro">("basic");
  const [isProExpanded, setIsProExpanded] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem("designImageMode") as "basic" | "pro" | null;
    if (savedMode) setImageMode(savedMode);
  }, []);

  const handleModeChange = (mode: "basic" | "pro") => {
    setImageMode(mode);
    localStorage.setItem("designImageMode", mode);
  };

  const generateDesignImage = async (mode: "basic" | "pro") => {
    if (!imagePrompt.trim()) {
      alert("Please describe the design concept you want");
      return;
    }

    setImageMode(mode);
    localStorage.setItem("designImageMode", mode);
    setIsGeneratingImage(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt, mode: mode })
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedImage(data.imageUrl || "");
      } else {
        const errorData = await response.json().catch(() => ({ error: "Could not generate image. Please try again." }));
        alert(errorData.error || "Could not generate image. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error generating image");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => setLocation("/#contact")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div>
            <h1 className="text-5xl md:text-6xl font-display font-black mb-4 gradient-bold">
              AI Design Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Create stunning design concepts instantly. Describe your vision, and our AI will generate professional mockups and visuals tailored to your needs.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Input Section */}
          <div className="space-y-8">
            {/* MAIN: Quick Design Generator - PROMINENT */}
            <div className="space-y-4 p-6 bg-accent/10 border-2 border-accent/40 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <h2 className="text-2xl font-black text-foreground">Quick Design Generator</h2>
                <span className="text-xs px-3 py-1 bg-accent/20 text-accent rounded-full font-bold">Fast. Free. Instant.</span>
              </div>

              <p className="text-sm text-muted-foreground">
                Generate AI design concepts in seconds using Pollinations AI
              </p>

              <Textarea
                placeholder="e.g., Modern minimalist logo with violet and teal colors for a creative agency"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="bg-background/50 border-white/10 min-h-[150px] text-base"
              />

              <Button
                onClick={() => generateDesignImage("basic")}
                disabled={isGeneratingImage}
                className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-bold text-base"
              >
                {isGeneratingImage && imageMode === "basic" ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Generate Design
                  </>
                )}
              </Button>
            </div>

            {/* Tips */}
            <div className="p-4 bg-background/40 border border-white/10 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-bold">💡 Tip:</span> Be specific with colors, style, and purpose for best results. E.g., "Minimalist tech startup logo, purple and cyan, flat design"
              </p>
            </div>
          </div>

          {/* Right: Generated Image Preview */}
          <div className="space-y-4">
            {generatedImage ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity" />
                  <div className="relative bg-background/50 border border-accent/30 rounded-2xl p-4 overflow-hidden">
                    <img
                      src={generatedImage}
                      alt="Generated design"
                      className="w-full rounded-lg shadow-2xl"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error("Image failed to load:", e);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2 p-4 bg-background/40 border border-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-primary">
                      {imageMode === "pro" ? "🎨 Pro Mode" : "⚡ Basic Mode"}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed font-medium">
                    {imagePrompt}
                  </p>
                </div>

                <Button
                  onClick={() => setGeneratedImage("")}
                  variant="outline"
                  className="w-full"
                >
                  Generate Another
                </Button>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-background/20">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    Your generated design will appear here
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    Write a prompt and click generate
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRO MODE: Hidden Far Below - User Must Scroll to Find */}
        <div className="mt-32 pt-16 border-t border-white/5">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="space-y-3">
              <button
                onClick={() => setIsProExpanded(!isProExpanded)}
                className="w-full flex items-center justify-between p-3 bg-background/20 hover:bg-background/40 border border-white/5 rounded-lg transition-all group opacity-60 hover:opacity-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg opacity-70">✨</span>
                  <div className="text-left">
                    <p className="font-semibold text-sm text-foreground/70">Advanced: High-Quality Mode (Pro)</p>
                    <p className="text-xs text-muted-foreground/60">Google Imagen API - Premium photorealistic visuals</p>
                  </div>
                </div>
                <span className={`text-primary/50 transition-transform ${isProExpanded ? "rotate-180" : ""}`}>▼</span>
              </button>

              {isProExpanded && (
                <div className="space-y-3 p-4 bg-primary/5 border border-primary/10 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300 opacity-75">
                  <p className="text-xs text-muted-foreground/80 leading-relaxed">
                    Uses Google Imagen API for photorealistic, ultra-premium quality visuals. Ideal for professional branding, packaging, and high-end portfolio work.
                  </p>
                  
                  <Button 
                    onClick={() => generateDesignImage("pro")}
                    disabled={isGeneratingImage}
                    className="w-full bg-primary/80 hover:bg-primary text-white font-bold text-sm py-2"
                  >
                    {isGeneratingImage && imageMode === "pro" ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        ✨ Generate Pro Design
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
