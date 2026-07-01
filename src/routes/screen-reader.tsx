import { createFileRoute, Link } from "@tanstack/react-router";

type Reader = { name: string; website: string; type: "Free" | "Commercial" };

const READERS: Reader[] = [
  { name: "Non Visual Desktop Access (NVDA)", website: "https://www.nvda-project.org/", type: "Free" },
  { name: "System Access To Go", website: "https://www.satogo.com/", type: "Free" },
  { name: "Thunder", website: "https://www.screenreader.net/index.php?pageid=2", type: "Free" },
  { name: "Hal", website: "https://www.yourdolphin.co.uk/productdetail.asp?id=5", type: "Commercial" },
  { name: "JAWS", website: "https://www.freedomscientific.com/Downloads/JAWS", type: "Commercial" },
  { name: "Supernova", website: "https://www.yourdolphin.co.uk/productdetail.asp?id=1", type: "Commercial" },
  { name: "Window-Eyes", website: "https://www.gwmicro.com/Window-Eyes/", type: "Commercial" },
];

export const Route = createFileRoute("/screen-reader")({
  head: () => ({
    meta: [
      { title: "Screen Reader Access — Government of Telangana" },
      { name: "description", content: "Information on screen reader software available for people with visual impairments to access this website." },
    ],
  }),
  component: ScreenReaderPage,
});

function ScreenReaderPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gov-navy text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="text-xs opacity-80 hover:underline">← Back to Home</Link>
          <h1 className="font-display text-3xl md:text-4xl font-black mt-3">Screen Reader Access</h1>
          <p className="text-sm opacity-90 mt-2 max-w-3xl">
            This portal complies with World Wide Web Consortium (W3C) accessibility standards, allowing people with visual impairments to access it using assistive technologies such as screen readers.
          </p>
        </div>
        <div className="gov-tricolor-bar" />
      </div>

      <article className="container mx-auto px-4 py-10 max-w-4xl prose prose-slate">
        <h2 className="font-display text-2xl font-black text-gov-navy">What is a Screen Reader?</h2>
        <p className="mt-3 text-foreground/85 leading-relaxed">
          A screen reader is a software application that enables people with severe visual impairments to use a computer. Screen readers work closely with the computer's Operating System (OS) to provide information about icons, menus, dialogue boxes, files and folders. A screen reader provides access to the entire OS that it works with, including many common applications.
        </p>
        <p className="mt-3 text-foreground/85 leading-relaxed">
          A screen reader uses a Text-To-Speech (TTS) engine to translate on-screen information into speech, which can be heard through earphones or speakers. A TTS may be a software application that comes bundled with the screen reader, or it may be a hardware device that plugs into the computer. Originally, before computers had soundcards, screen readers always used hardware TTS devices, but now that soundcards come as standard on all computers, many find that a software TTS is preferable.
        </p>
        <p className="mt-3 text-foreground/85 leading-relaxed">
          In addition to speech feedback, screen readers are also capable of providing information in Braille. An external hardware device, known as a refreshable Braille display, is needed for this. A refreshable Braille display contains one or more rows of cells. Each cell can be formed into the shape of a Braille character — a series of dots similar to domino dots in layout. As the information on the computer screen changes, so do the Braille characters on the display, providing refreshable information directly from the computer. While it is possible to use either format independently, Braille output is commonly used in conjunction with speech output.
        </p>

        <h2 className="font-display text-2xl font-black text-gov-navy mt-10">Information related to various screen readers</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gov-navy text-primary-foreground">
              <tr>
                <th className="text-left px-4 py-3">Screen Reader</th>
                <th className="text-left px-4 py-3">Website</th>
                <th className="text-left px-4 py-3">Free / Commercial</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {READERS.map((r) => (
                <tr key={r.name} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3">
                    <a href={r.website} target="_blank" rel="noopener noreferrer" className="text-gov-green hover:underline break-all">
                      {r.website}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${r.type === "Free" ? "bg-gov-green/15 text-gov-green" : "bg-gov-saffron/20 text-gov-navy"}`}>
                      {r.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </div>
  );
}