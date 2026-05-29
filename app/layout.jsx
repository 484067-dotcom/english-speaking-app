export const metadata = {
  title: "English Speaking Practice",
  description: "Conversation practice app for English classes"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
