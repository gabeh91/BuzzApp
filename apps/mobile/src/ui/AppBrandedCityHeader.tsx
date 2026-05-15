import type { ReactNode } from "react";

import { useI18n } from "@/i18n/I18nProvider";

import { Header } from "./Header";
import { Text as UiText } from "./Text";

export type AppBrandedCityHeaderProps = {
  cityName: string;
  right?: ReactNode;
};

export const AppBrandedCityHeader = ({
  cityName,
  right,
}: AppBrandedCityHeaderProps) => {
  const { LL } = useI18n();

  return (
    <Header
      left={<UiText variant="logo">{LL.brand.name()}</UiText>}
      right={right ?? <UiText variant="city">{cityName}</UiText>}
    />
  );
};
