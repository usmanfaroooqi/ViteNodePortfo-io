import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Section, FadeIn } from "@/components/ui/layout-components";
import { PERSONAL_DETAILS } from "@/data/resume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone, CheckCircle2, Sparkles, Loader2, Lightbulb, Wand2, BookOpen, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useToast } from "@/hooks/use-toast";
import { ErrorHandler, getErrorToastConfig, getSuccessToastConfig } from "@/lib/errors";

export function Contact() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [defaultSubject, setDefaultSubject] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [messageRef, setMessageRef] = useState<HTMLTextAreaElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [subjectRef, setSubjectRef] = useState<HTMLInputElement | null>(null);
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [briefQuery, setBriefQuery] = useState("");
  const [generatedBrief, setGeneratedBrief] = useState("");
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);

  useEffect(() => {
    const handlePrefill = (e: CustomEvent) => {
      if (e.detail && e.detail.subject) {
        setDefaultSubject(e.detail.subject);
      }
    };
    
    window.addEventListener("prefillContact" as any, handlePrefill as any);
    return () => {
      window.removeEventListener("prefillContact" as any, handlePrefill as any);
    };
  }, []);

  const generateIdeas = async () => {
    try {
      if (!subjectRef || !subjectRef.value.trim()) {
        const error = ErrorHandler.emptyInput("Project Type");
        toast(getErrorToastConfig(error));
        return;
      }
      
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const projectType = subjectRef.value.trim();
      const ideas = generateDesignIdeas(projectType);
      
      if (messageRef) {
        messageRef.value = ideas;
      }
      
      toast(getSuccessToastConfig("Design ideas generated successfully!"));
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, "generateIdeas");
      toast(getErrorToastConfig(appError));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDesignBrief = async () => {
    try {
      setBriefError(null);

      // Validate input
      if (!briefQuery.trim()) {
        const error = ErrorHandler.emptyInput("Business Idea");
        ErrorHandler.logError(error, "generateDesignBrief");
        setBriefError(error.userMessage);
        toast(getErrorToastConfig(error));
        return;
      }

      if (briefQuery.trim().length < 10) {
        const error = ErrorHandler.invalidInput(
          "Business Idea",
          "Please provide at least 10 characters"
        );
        ErrorHandler.logError(error, "generateDesignBrief");
        setBriefError(error.userMessage);
        toast(getErrorToastConfig(error));
        return;
      }

      setIsGeneratingBrief(true);
      
      const response = await fetch("/api/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: briefQuery }),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        const error = await ErrorHandler.handleFetchError(response);
        ErrorHandler.logError(error, "generateDesignBrief API response");
        setBriefError(error.userMessage);
        toast(getErrorToastConfig(error));
        return;
      }

      const data = await response.json();

      if (!data.brief) {
        const error = ErrorHandler.parseError("Empty response from server");
        ErrorHandler.logError(error, "generateDesignBrief empty response");
        setBriefError(error.userMessage);
        toast(getErrorToastConfig(error));
        return;
      }

      setGeneratedBrief(data.brief);
      toast(getSuccessToastConfig("Design brief generated successfully!"));
    } catch (error: any) {
      if (error.name === "AbortError") {
        const timeoutError = ErrorHandler.timeoutError();
        ErrorHandler.logError(timeoutError, "generateDesignBrief timeout");
        setBriefError(timeoutError.userMessage);
        toast(getErrorToastConfig(timeoutError));
      } else {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, "generateDesignBrief");
        setBriefError(appError.userMessage);
        toast(getErrorToastConfig(appError));
      }
    } finally {
      setIsGeneratingBrief(false);
    }
  };


  const generateDesignIdeas = (projectType: string): string => {
    const ideas: { [key: string]: string } = {
      "logo design": `Design Concepts for Logo:

1. MINIMALIST MARK
   - Clean, geometric shape representing your initials
   - Single color (prefer navy or violet)
   - Scalable across all mediums

2. ABSTRACT ICON
   - Modern symbol reflecting design philosophy
   - Versatile for web & print
   - Memorable and distinctive

3. WORDMARK
   - Custom typography with your name
   - Integrated with a subtle icon
   - Bold, professional presence

Color Palette: Midnight Navy (#0B0F1A), Royal Violet (#8F00FF), Sky Teal (#00E0C6)
Typography: DM Sans or Poppins for modern feel
Style: Contemporary, premium, minimalist`,

      "branding": `Complete Branding Strategy:

1. BRAND IDENTITY
   - Core values and mission statement
   - Visual language and design principles
   - Target audience analysis

2. VISUAL SYSTEM
   - Primary logo and variations
   - Color palette with specifications
   - Typography system (headings, body, accents)

3. APPLICATION GUIDELINES
   - Brand positioning and messaging
   - Marketing collateral design
   - Digital & print touchpoints

Recommended Approach: Premium, modern aesthetic with violet and teal accents. Focus on clean, minimalist design reflecting professionalism.`,

      "social media": `Social Media Content Strategy:

1. VISUAL STYLE
   - Consistent color palette (violet/teal theme)
   - Square and vertical formats
   - High-quality photography & graphics

2. CONTENT PILLARS
   - Portfolio showcases (60%)
   - Design tips & process (20%)
   - Behind-the-scenes content (20%)

3. POSTING SCHEDULE
   - 3-4 posts per week
   - Stories for engagement
   - Reels for reach and discovery

Platforms: Instagram, Pinterest, LinkedIn
Format: Grid-friendly designs with strong visual hierarchy`,

      "packaging": `Packaging Design Concepts:

1. STRUCTURAL DESIGN
   - Custom box/container shape
   - Eco-friendly materials option
   - Unboxing experience focus

2. VISUAL DESIGN
   - Brand logo prominently displayed
   - Consistent color scheme
   - Typography hierarchy

3. FUNCTIONAL ELEMENTS
   - QR codes for product info
   - Sustainability messaging
   - Brand story integration

Materials: Premium cardboard, matte finish with spot UV
Design: Modern, luxury feel with your brand colors`,

      "print materials": `Print Design Package:

1. BUSINESS CARDS
   - Double-sided design
   - Premium stock (300gsm minimum)
   - Spot UV or foil accents

2. LETTERHEAD & ENVELOPES
   - Consistent brand identity
   - Professional layout
   - Quality paper stock

3. BROCHURES & FLYERS
   - Compelling layout with hierarchy
   - High-resolution images
   - Clear call-to-action

Specifications: CMYK color mode, 300 DPI minimum, bleed requirements
Printing: Professional offset or digital printing`
    };

    const lowercaseProject = projectType.toLowerCase();
    
    for (const [key, value] of Object.entries(ideas)) {
      if (lowercaseProject.includes(key) || key.includes(lowercaseProject)) {
        return value;
      }
    }

    return `Design Ideas for "${projectType}":

1. CONCEPT EXPLORATION
   - 3-5 unique design directions
   - Modern and professional approach
   - Aligned with current trends

2. CREATIVE EXECUTION
   - Color palette with primary and accent colors
   - Typography recommendations
   - Visual style and mood

3. DELIVERABLES
   - High-resolution files
   - Multiple format exports
   - Brand guidelines documentation

Next Steps: Let's discuss your specific vision and requirements to create something exceptional!`;
  };

  const enhanceMessage = async () => {
    if (!messageRef || !messageRef.value.trim()) return;
    
    setIsEnhancing(true);
    
    // Simulate AI enhancement delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const message = messageRef.value.trim();
    const enhanced = enhanceMessageText(message);
    
    if (messageRef) {
      messageRef.value = enhanced;
    }
    
    setIsEnhancing(false);
  };

  const enhanceMessageText = (text: string): string => {
    let enhanced = text;

    // Add greeting if missing
    if (!enhanced.match(/^(hi|hello|hey|good|greetings)/i)) {
      enhanced = `I'm reaching out regarding a design project. ${enhanced}`;
    }

    // Ensure proper punctuation
    enhanced = enhanced.replace(/([^.!?])\s*$/m, "$1.");

    // Add structure - convert bullet points to proper sentences
    enhanced = enhanced.replace(/[-•]\s+/g, "• ");

    // Enhance common phrases
    enhanced = enhanced
      .replace(/\bi want\b/gi, "I'm interested in")
      .replace(/\bcan you\b/gi, "Would you be able to")
      .replace(/\byou should\b/gi, "I'd appreciate if you could")
      .replace(/\breally good\b/gi, "exceptional")
      .replace(/\bnice\b/gi, "professional")
      .replace(/\bcool\b/gi, "impressive")
      .replace(/\bsoon\b/gi, "at your earliest convenience");

    // Add professional closing if missing
    if (!enhanced.match(/thanks|regards|appreciate|looking forward/i)) {
      enhanced += "\n\nI look forward to hearing from you.";
    }

    return enhanced;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/xldopzby", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setIsSent(true);
        form.reset();
        setDefaultSubject(""); // Reset subject after send
      } else {
        alert("Oops! There was a problem sending your form");
      }
    } catch (error) {
      alert("Oops! There was a problem sending your form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section id="contact" className="pb-32 bg-gradient-to-t from-white/5 to-transparent">
      <FadeIn>
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Let's Work Together</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a project in mind? I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.
          </p>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-12">
        <FadeIn delay={0.3}>
          <div className="space-y-8">
             <div className="flex items-start gap-4">
               <div className="bg-primary/10 p-3 rounded-full">
                 <Mail className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h3 className="font-bold text-lg mb-1">Email Me</h3>
                 <a href={`mailto:${PERSONAL_DETAILS.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                   {PERSONAL_DETAILS.email}
                 </a>
               </div>
             </div>

             <div className="flex items-start gap-4">
               <div className="bg-primary/10 p-3 rounded-full">
                 <Phone className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h3 className="font-bold text-lg mb-1">Call Me</h3>
                 <a href={`tel:${PERSONAL_DETAILS.phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                   {PERSONAL_DETAILS.phone}
                 </a>
               </div>
             </div>

             <div className="flex items-start gap-4">
               <div className="bg-primary/10 p-3 rounded-full">
                 <MapPin className="w-6 h-6 text-primary" />
               </div>
               <div>
                 <h3 className="font-bold text-lg mb-1">Location</h3>
                 <p className="text-muted-foreground">
                   Available for remote work worldwide.
                 </p>
               </div>
             </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <Card className="bg-secondary/30 border-white/5">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input name="name" placeholder="Your name" required className="bg-background/50 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input name="email" placeholder="Your email" type="email" required className="bg-background/50 border-white/10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Subject</label>
                    <button 
                      type="button"
                      onClick={generateIdeas}
                      disabled={isGenerating}
                      className="text-xs flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Lightbulb className="w-3 h-3" />
                          Generate Ideas
                        </>
                      )}
                    </button>
                  </div>
                  <Input 
                    ref={setSubjectRef}
                    name="subject" 
                    placeholder="e.g., Logo Design, Branding, Social Media" 
                    required 
                    className="bg-background/50 border-white/10" 
                    defaultValue={defaultSubject}
                    key={defaultSubject}
                  />
                </div>
                <div className="space-y-3 bg-accent/5 border border-accent/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-accent" />
                      <label className="text-sm font-medium">Get Design Inspiration</label>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { setIsBriefOpen(true); setBriefQuery(""); setGeneratedBrief(""); }}
                      className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/20 text-accent hover:bg-accent/30 transition-all font-bold"
                    >
                      AI Brief →
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">Generate a creative design brief to inspire your project description</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Message</label>
                    <button 
                      type="button"
                      onClick={enhanceMessage}
                      disabled={isEnhancing}
                      className="text-xs flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          Enhance
                        </>
                      )}
                    </button>
                  </div>
                  <Textarea 
                    ref={setMessageRef}
                    name="message" 
                    placeholder="Tell me about your project..." 
                    required 
                    className="bg-background/50 border-white/10 min-h-[150px]" 
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-medium">
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      </div>

      {/* Sent Success Popup */}
      <Dialog open={isSent} onOpenChange={setIsSent}>
        <DialogContent className="sm:max-w-md bg-background/90 backdrop-blur-xl border-primary/20">
           <VisuallyHidden.Root>
             <DialogTitle>Message Sent</DialogTitle>
           </VisuallyHidden.Root>
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold">Message Sent!</h3>
            <p className="text-muted-foreground">
              Thank you for reaching out. I'll get back to you as soon as possible.
            </p>
            <Button className="mt-4" onClick={() => setIsSent(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Design Brief AI Modal - Premium Interface */}
      <Dialog open={isBriefOpen} onOpenChange={setIsBriefOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-2xl border border-primary/30 shadow-2xl">
          <VisuallyHidden.Root>
            <DialogTitle>Design Brief Generator</DialogTitle>
          </VisuallyHidden.Root>
          
          {/* Premium Header */}
          <div className="border-b border-primary/20 pb-6 pt-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-3xl font-display font-black text-foreground">Design Brief AI</h3>
                <p className="text-xs text-accent/80 font-medium">Powered by Gemini 2.0-flash</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">Describe your business or product idea, and get a creative, actionable design brief tailored to your vision.</p>
          </div>

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {/* Input Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                Your Business Idea
              </label>
              <textarea
                placeholder="e.g., A sustainable fashion brand for young professionals, focused on eco-friendly streetwear..."
                value={briefQuery}
                onChange={(e) => setBriefQuery(e.target.value)}
                className="w-full h-24 px-4 py-3 rounded-xl bg-background/50 border border-white/10 hover:border-primary/30 focus:border-primary/60 focus:outline-none text-foreground placeholder:text-muted-foreground/60 resize-none transition-all duration-300 text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">Tip: Be specific about your target audience, values, or unique angle</p>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={generateDesignBrief}
              disabled={isGeneratingBrief || !briefQuery.trim()}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGeneratingBrief ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Generating your brief...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Design Brief</span>
                </>
              )}
            </Button>

            {/* Error Display */}
            {briefError && (
              <div className="animate-in fade-in duration-300 p-4 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/80 mt-1">{briefError}</p>
                </div>
              </div>
            )}

            {/* Output Section */}
            {generatedBrief && (
              <div className="space-y-3 animate-in fade-in duration-500">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Your Design Brief
                </label>
                <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/40 rounded-xl p-5 max-h-80 overflow-y-auto group hover:border-primary/60 transition-all duration-300">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium tracking-wide">
                    {generatedBrief}
                  </p>
                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <p className="text-xs text-accent font-semibold">✨ Ready to use in your project</p>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!generatedBrief && !isGeneratingBrief && !briefError && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Type your idea above and click generate to see your design brief</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </Section>
  );
}
