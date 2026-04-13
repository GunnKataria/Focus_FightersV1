import Flashcard from "../../../components/game/Flashcard";
import Btn from "../../../components/ui/Btn";
import { SectionTitle } from "../../../components/ui/Typography";
import { FLASHCARDS } from "../../../constants";

export default function FlashcardTab({
  currentCard,
  setCurrentCard,
  cardFlipped,
  setCardFlipped,
  cardAnswered,
  setCardAnswered,
  onCorrectAnswer,
  onWrongAnswer,
}) {
  const resetCard = (index) => {
    setCurrentCard(index);
    setCardFlipped(false);
    setCardAnswered(false);
  };

  return (
    <div className="animate-fade">
      <SectionTitle>⚡ Answer correctly for bonus damage!</SectionTitle>
      <Flashcard
        card={FLASHCARDS[currentCard]}
        flipped={cardFlipped}
        answered={cardAnswered}
        onFlip={() => setCardFlipped((f) => !f)}
        onAnswer={(correct) => {
          setCardAnswered(true);
          if (correct) {
            onCorrectAnswer();
          } else {
            onWrongAnswer();
          }
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: ".75rem",
        }}
      >
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => resetCard(Math.max(0, currentCard - 1))}
        >
          ◀ Prev
        </Btn>
        <span
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: ".78rem",
            color: "var(--text-muted)",
          }}
        >
          Card {currentCard + 1} / {FLASHCARDS.length}
        </span>
        <Btn
          variant="ghost"
          size="sm"
          onClick={() => resetCard((currentCard + 1) % FLASHCARDS.length)}
        >
          Next ▶
        </Btn>
      </div>
    </div>
  );
}