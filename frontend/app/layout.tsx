import "./globals.css";

export const metadata = {
  title: "Simple AI Chatbot",
  description: "Minimalist AI chatbot with streaming responses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
