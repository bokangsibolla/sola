import { StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { colors, fonts } from '@/constants/design';

const markdownStyles = StyleSheet.create({
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 24, color: colors.textPrimary },
  heading2: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 26, color: colors.textPrimary, marginTop: 16, marginBottom: 8 },
  heading3: { fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 22, color: colors.textPrimary, marginTop: 12, marginBottom: 6 },
  strong: { fontFamily: fonts.semiBold },
  link: { color: colors.orange, textDecorationLine: 'none' },
  bullet_list: { marginVertical: 4 },
  bullet_list_icon: { color: colors.orange, fontSize: 8, marginTop: 8, marginRight: 8 },
  ordered_list_icon: { color: colors.orange, fontFamily: fonts.semiBold },
  paragraph: { marginTop: 0, marginBottom: 12 },
});

export default function MarkdownContent({ children }: { children: string }) {
  return <Markdown style={markdownStyles}>{children}</Markdown>;
}
