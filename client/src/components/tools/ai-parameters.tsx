import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, Info, RotateCcw } from "lucide-react";
import { AIParameters } from "@shared/schema";

// Default AI parameters
const DEFAULT_PARAMETERS: AIParameters = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 2048,
};

interface AIParametersProps {
  parameters: AIParameters;
  onChange: (parameters: AIParameters) => void;
  onReset: () => void;
}

export function AIParametersDialog({
  parameters,
  onChange,
  onReset,
}: AIParametersProps) {
  const [localParameters, setLocalParameters] = useState<AIParameters>(parameters);
  const [open, setOpen] = useState(false);

  const handleTemperatureChange = (value: number[]) => {
    setLocalParameters({ ...localParameters, temperature: value[0] });
  };

  const handleTopPChange = (value: number[]) => {
    setLocalParameters({ ...localParameters, topP: value[0] });
  };

  const handleTopKChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 100) {
      setLocalParameters({ ...localParameters, topK: numValue });
    }
  };

  const handleMaxTokensChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 50 && numValue <= 8192) {
      setLocalParameters({ ...localParameters, maxOutputTokens: numValue });
    }
  };

  const handleSave = () => {
    onChange(localParameters);
    setOpen(false);
  };

  const handleReset = () => {
    setLocalParameters(DEFAULT_PARAMETERS);
    onReset();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setLocalParameters(parameters);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span>AI Parameters</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>AI Generation Parameters</DialogTitle>
          <DialogDescription>
            Customize how the AI generates content. Hover over each parameter for more information.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="temperature">Temperature</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Controls randomness. Lower values (0.2) make output more focused and deterministic. Higher values (0.8) make output more creative and varied.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-mono">{localParameters.temperature.toFixed(1)}</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[localParameters.temperature]}
              onValueChange={handleTemperatureChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="topP">Top-p</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Controls diversity by limiting to the top percentage of probability mass. Set to 0.9 to consider tokens comprising the top 90% probability mass.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-mono">{localParameters.topP.toFixed(1)}</span>
            </div>
            <Slider
              id="topP"
              min={0}
              max={1}
              step={0.1}
              value={[localParameters.topP]}
              onValueChange={handleTopPChange}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="topK">Top-k</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Limits token selection to the top K most likely tokens. Set to 40 to consider only the top 40 tokens.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Input
              id="topK"
              type="number"
              min={1}
              max={100}
              value={localParameters.topK}
              onChange={(e) => handleTopKChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="maxOutputTokens">Max Output Tokens</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Maximum number of tokens that can be generated in the response. 1 token is approximately 4 characters. 2048 tokens is roughly 500-1000 words.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Input
              id="maxOutputTokens"
              type="number"
              min={50}
              max={8192}
              value={localParameters.maxOutputTokens}
              onChange={(e) => handleMaxTokensChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}