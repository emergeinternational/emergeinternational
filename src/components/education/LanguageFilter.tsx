
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Globe } from "lucide-react";
import { Language } from "@/types/education";

interface LanguageFilterProps {
  selectedLanguage?: Language;
  onSelectLanguage: (language?: Language) => void;
}

export function LanguageFilter({ 
  selectedLanguage, 
  onSelectLanguage 
}: LanguageFilterProps) {
  const languages: { value: Language; label: string }[] = [
    { value: 'en', label: 'English' },
    { value: 'am', label: 'Amharic' },
    { value: 'es', label: 'Spanish' }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4" />
        Language
      </h3>
      <ToggleGroup 
        type="single" 
        value={selectedLanguage} 
        onValueChange={(value: Language | undefined) => onSelectLanguage(value)}
        className="flex flex-wrap gap-2"
      >
        {languages.map((language) => (
          <ToggleGroupItem 
            key={language.value} 
            value={language.value}
            className="border border-gray-700 hover:bg-emerge-gold/20 data-[state=on]:bg-emerge-gold data-[state=on]:text-white"
          >
            {language.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
