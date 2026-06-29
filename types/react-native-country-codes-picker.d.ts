declare module 'react-native-country-codes-picker' {
  import type { ComponentType } from 'react';
  import type { TextStyle, ViewStyle } from 'react-native';

  export interface CountryItem {
    name: Record<string, string>;
    dial_code: string;
    code: string;
    flag: string;
  }

  export interface Style {
    backdrop?: ViewStyle;
    modal?: ViewStyle;
    line?: ViewStyle;
    searchMessageText?: TextStyle;
    itemsList?: ViewStyle;
    modalInner?: ViewStyle;
    countryMessageContainer?: ViewStyle;
    textInput?: TextStyle;
    countryButtonStyles?: ViewStyle;
    flag?: TextStyle;
    dialCode?: TextStyle;
    countryName?: TextStyle;
  }

  export interface CountryPickerProps {
    show: boolean;
    lang?: string;
    inputPlaceholder?: string;
    inputPlaceholderTextColor?: TextStyle['color'];
    searchMessage?: string;
    initialState?: string;
    style?: Style;
    onBackdropPress?: () => void;
    onRequestClose?: () => void;
    pickerButtonOnPress: (item: CountryItem) => void;
  }

  export const CountryPicker: ComponentType<CountryPickerProps>;
}
