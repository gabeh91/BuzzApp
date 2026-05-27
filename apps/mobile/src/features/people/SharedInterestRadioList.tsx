import { InterestPill, InterestPillRow } from "@/features/interests/InterestPill";

export type SharedInterestOption = {
  id: string;
  name: string;
  slug?: string;
};

export type SharedInterestRadioListProps = {
  interests: SharedInterestOption[];
  onSelect: (interestId: string) => void;
  selectedId: string;
};

export const SharedInterestRadioList = ({
  interests,
  onSelect,
  selectedId,
}: SharedInterestRadioListProps) => {
  return (
    <InterestPillRow accessibilityRole="radiogroup">
      {interests.map((interest) => {
        const selected = interest.id === selectedId;

        return (
          <InterestPill
            interest={interest}
            key={interest.id}
            onPress={() => onSelect(interest.id)}
            selected={selected}
            showRadio
          />
        );
      })}
    </InterestPillRow>
  );
};
