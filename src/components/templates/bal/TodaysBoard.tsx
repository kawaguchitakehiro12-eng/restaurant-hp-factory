import { SampleLabel } from "@/components/demo/SampleLabel";
import { FadeIn } from "@/components/ui/FadeIn";
import { BalSectionHead } from "@/components/templates/bal/ui/BalSectionHead";
import type { BalCourse, BalMenuItem } from "@/types/bal";

type TodaysBoardProps = {
  boardItems: BalMenuItem[];
  courses: BalCourse[];
};

export function TodaysBoard({ boardItems, courses }: TodaysBoardProps) {
  if (boardItems.length === 0 && courses.length === 0) return null;

  return (
    <section id="board" className="bal-section bal-board-section">
      <div className="bal-shell">
        <FadeIn>
          <BalSectionHead
            en="TODAY'S BOARD"
            ja="今日の黒板"
            lead="市場と畑の都合で、毎日少しずつ変わります。"
          />
        </FadeIn>

        <FadeIn delay={0.06} className="bal-board">
          <div className="bal-board-surface">
            {boardItems.length > 0 ? (
              <div className="bal-board-col">
                <p className="bal-board-label">— OGGI / HOY —</p>
                <ul className="bal-board-list">
                  {boardItems.map((item, index) => (
                    <li key={`${item.name}-${index}`} className="bal-board-item">
                      <p className="bal-board-line">
                        <span className="bal-board-name">
                          {item.badge ? <em className="bal-board-badge">{item.badge}</em> : null}
                          {item.name}
                        </span>
                        <span className="bal-board-dots" aria-hidden />
                        <span className="bal-board-price">{item.price}</span>
                      </p>
                      {item.description || item.isSample ? (
                        <p className="bal-board-desc">
                          {item.description}
                          {item.isSample ? <SampleLabel /> : null}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {courses.length > 0 ? (
              <div className="bal-board-col bal-board-col--courses">
                <p className="bal-board-label">— PARA LA MESA —</p>
                <ul className="bal-board-courses">
                  {courses.map((course, index) => (
                    <li
                      key={`${course.name}-${index}`}
                      className={`bal-board-course ${course.featured ? "bal-board-course--featured" : ""}`}
                    >
                      {course.featured ? <span className="bal-board-star">おすすめ</span> : null}
                      <p className="bal-board-course-name">{course.name}</p>
                      <p className="bal-board-course-price">{course.price}</p>
                      {course.note ? <p className="bal-board-course-note">{course.note}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="bal-board-chalk" aria-hidden>
              Salud!
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
