import {
  HERO_IMAGE_FIT_OPTIONS,
  HERO_OBJECT_POSITION_OPTIONS,
  type HeroImageFit,
  type HeroObjectPosition,
} from "@/types/hero-display";

type HeroDisplaySettingsProps = {
  heroFit: HeroImageFit;
  heroObjectPosition: HeroObjectPosition;
  onChange: (patch: {
    heroFit?: HeroImageFit;
    heroObjectPosition?: HeroObjectPosition;
  }) => void;
  previewUrl?: string;
};

export function HeroDisplaySettings({
  heroFit,
  heroObjectPosition,
  onChange,
  previewUrl,
}: HeroDisplaySettingsProps) {
  return (
    <div className="admin-hero-display-settings">
      <h3 className="admin-edit-subheading">ファーストビュー表示調整</h3>
      <p className="admin-form-hint mb-3">
        画像がドアップになる場合は、表示位置や contain をお試しください。
      </p>

      <div className="admin-form-grid">
        <div className="admin-form-group">
          <label className="admin-form-label">表示モード</label>
          <select
            className="admin-form-select"
            value={heroFit}
            onChange={(e) => onChange({ heroFit: e.target.value as HeroImageFit })}
          >
            {HERO_IMAGE_FIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-form-group">
          <label className="admin-form-label">表示位置（object-position）</label>
          <select
            className="admin-form-select"
            value={heroObjectPosition}
            onChange={(e) =>
              onChange({ heroObjectPosition: e.target.value as HeroObjectPosition })
            }
          >
            {HERO_OBJECT_POSITION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {previewUrl ? (
        <div className="admin-hero-display-preview mt-4">
          <p className="admin-form-label mb-2">プレビュー</p>
          <div className="admin-hero-display-preview-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="ファーストビュープレビュー"
              style={{
                objectFit: heroFit,
                objectPosition: heroObjectPosition,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
