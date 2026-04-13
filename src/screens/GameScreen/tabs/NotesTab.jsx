import Card from "../../../components/ui/Card";
import Btn from "../../../components/ui/Btn";
import { SectionTitle } from "../../../components/ui/Typography";

export default function NotesTab({ notes, push }) {
  const handleDownload = () => {
    const blob = new Blob([notes.replace(/<[^>]*>/g, "")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "focus-fighters-notes.txt";
    a.click();
    push("📥 Notes downloaded!", "success");
  };

  return (
    <div className="animate-fade">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: ".75rem",
        }}
      >
        <SectionTitle>📋 Session Notes</SectionTitle>
        {notes && (
          <Btn variant="gold" size="sm" onClick={handleDownload}>
            ⬇ Download
          </Btn>
        )}
      </div>
      <Card>
        {notes ? (
          <div
            style={{ fontSize: ".9rem", lineHeight: 1.7, color: "var(--text-secondary)" }}
            dangerouslySetInnerHTML={{ __html: notes }}
          />
        ) : (
          <p
            style={{
              textAlign: "center",
              padding: "2rem 0",
              color: "var(--text-muted)",
              fontSize: ".9rem",
            }}
          >
            Notes will appear here after generation.
            <br />
            Switch to Study mode and click ✨ Generate Notes.
          </p>
        )}
      </Card>
    </div>
  );
}