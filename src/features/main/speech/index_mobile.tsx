import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useStorage } from "@/core/provider/storage_provider"
import { Copy, Loader2Icon, LogOut } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import React, { useRef, useState } from "react"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { handleError, voice } from "@/lib/utils"
import { apiV1 } from "@/core/api"
import type { BaseResponse } from "@/core/types/base_response"
import type { Generated } from "@/core/types/generated"
import { toast } from "sonner"

export const SpeechMobile = (): React.JSX.Element => {
  const storage = useStorage();
  const user = storage?.data?.user;
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [selectedVoice, setVoice] = useState<string | undefined>(voice[0]?.id);
  const ref = useRef<HTMLTextAreaElement>(null);

  const LogOutHandler = () => {
    localStorage.removeItem('storage');
    window.location.reload();
  }

  const diffInDays = (): number => {
    const now = new Date();
    const validAt = user?.validAt ? new Date(user.validAt) : now;

    const diffTime = Math.abs(validAt.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  const generateSpeech = async () => {
    try {
      if (ref.current?.value === "") return toast.error("Please Enter Text to Generate Speech", { position: 'top-center' });
      setLoading(true);
      const response = await apiV1<BaseResponse<Generated>>({
        method: 'POST',
        path: '/speech/generate',
        body: { voice: selectedVoice, text: ref.current?.value, speed: speed }
      });

      setAudioUrl(response?.data?.path);
      toast.success(response?.message, { position: 'top-center' });
    } catch (error) {
      const exception = handleError(error);
      toast.error(exception.error, { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  }

  return <>
    <div className="w-dvw h-dvh">
      <div className="flex gap-0 items-stretch h-full">
        <div className="w-full max-w-6xl">
          <div className="flex flex-col h-dvh p-4">
            <div className="text-2xl font-bold">Voicify</div>
            <div className="text-sm mb-4">Generate text to speech in seconds</div>
            <div className="p-4 border border-gray-200 mb-4 w-full">
              <div className="flex gap-x-3 items-center">
                <img src={"https://ui-avatars.com/api/?name=" + user?.name} className="size-11 rounded-full object-cover" />
                <div className="flex flex-col">
                  <div className="text-md font-semibold">{user?.name}</div>
                  <div className="text-xs line-clamp-1 text-neutral-700">{user?.id}</div>
                </div>
                <Button variant="outline" className="ml-auto size-10 cursor-pointer"><Copy /></Button>
                <Button onClick={LogOutHandler} variant="default" className="size-10 cursor-pointer"><LogOut /></Button>
              </div>
              <Progress value={Math.floor((30 - diffInDays()) / 100)} className="w-full mt-4" />
              <div className="flex items-center justify-between mt-2">
                <Label className="text-xs">Expired In</Label>
                <Label className="text-xs font-semibold">{diffInDays()} Days</Label>
              </div>
            </div>
            <div className="flex-1 flex items-center">
              <textarea
                ref={ref}
                className="w-full border-0 text-md lg:text-3xl md:p-4 lg:p-8 border-none outline-none shadow-none focus:ring-0"
                placeholder="Enter your desired text here..."
                maxLength={1000}
                rows={6}
                
              />
            </div>
            <div className="p-4 rounded-md border border-gray-200 my-4">
              <Label className="text-md mb-2">Configuration</Label>
              <Label htmlFor="voice" className="text-sm mb-2">Select Voice</Label>
              <Select onValueChange={(v) => setVoice(v)} value={selectedVoice}>
                <SelectTrigger className="w-full mb-4">
                  <SelectValue placeholder="Select Voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {voice.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-x-2">
                          <img src={`https://flagsapi.com/${v.country}/shiny/64.png`} className="size-6" />
                          <div>{v.name}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between mb-4">
                <Label>Speed</Label>
                <Label className="text-sm font-normal">{speed}x</Label>
              </div>
              <Slider className="mb-4" min={0} onValueChange={(v) => setSpeed(v[0])} defaultValue={[speed]} max={2} step={0.1} />
            </div>
            {
              audioUrl && (
                <div className="flex-1 space-y-2">
                  <Label htmlFor="video-voice">Voice</Label>
                  <audio
                    className="w-full"
                    src={audioUrl}
                    controls
                  >
                    Your browser does not support the
                    <code>audio</code> element.
                  </audio>
                </div>
              )
            }
            <div className="w-full">
              <Button onClick={generateSpeech} type="submit" className="cursor-pointer w-full">
                {loading ? <Loader2Icon className="animate-spin" /> : null}
                Generate Speech
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
}