import { Stack } from "expo-router";

const AuthModalLayout = () => {
  return (
    <Stack
      screenOptions={{
        animation: "slide_from_right",
        headerShown: false,
      }}
    />
  );
};

export default AuthModalLayout;
