/**
 * Section title block — consistent hierarchy for dashboard regions.
 */
export default function SectionHeader({ kicker, title, description, action }) {
    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 pb-4 mb-6 border-b border-[var(--color-border)]">
            <div className="min-w-0 space-y-1">
                {kicker ? (
                    <p className="ui-kicker">{kicker}</p>
                ) : null}
                <h2 className="ui-section-title">{title}</h2>
                {description ? (
                    <p className="ui-section-desc">{description}</p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </header>
    );
}
