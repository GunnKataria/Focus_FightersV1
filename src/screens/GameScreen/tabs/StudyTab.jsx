import StudyPage from "../../../components/game/StudyPage";
import Btn from "../../../components/ui/Btn";
import { STUDY_PAGES } from "../../../constants";

export default function StudyTab({
  currentPage,
  setCurrentPage,
  generateNotes,
  notesLoading,
}) {
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
        <div style={{ display: "flex", gap: ".5rem", alignItems: "center" }}>
          <Btn
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            ◀
          </Btn>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: ".78rem",
              color: "var(--text-muted)",
            }}
          >
            Page {currentPage + 1} / {STUDY_PAGES.length}
          </span>
          <Btn
            variant="ghost"
            size="sm"
            onClick={() =>
              setCurrentPage((p) => Math.min(STUDY_PAGES.length - 1, p + 1))
            }
            disabled={currentPage === STUDY_PAGES.length - 1}
          >
            ▶
          </Btn>
        </div>
        <Btn
          variant="primary"
          size="sm"
          onClick={generateNotes}
          disabled={notesLoading}
        >
          {notesLoading ? "⌛ Generating…" : "✨ Generate Notes"}
        </Btn>
      </div>
      <StudyPage page={STUDY_PAGES[currentPage]} />
    </div>
  );
}