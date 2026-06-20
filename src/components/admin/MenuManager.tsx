"use client";

import Image from "next/image";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { isInlineImageSrc } from "@/lib/images/image-src";
import { useState } from "react";
import { GripVertical, Plus, Trash2, Upload } from "lucide-react";
import { DirtyForm } from "@/components/admin/DirtyForm";
import { SaveBar } from "@/components/admin/SaveBar";
import { getMenuCountLabel, MENU_MAX_ITEMS } from "@/lib/admin/menu";
import type { StoreMenuItem } from "@/types/store";

const DESC_PLACEHOLDERS = [
  "毎朝仕入れた鮮魚を使用しています",
  "備長炭でじっくり焼き上げます",
  "地元農家さんの野菜をたっぷり使っています",
];

type MenuItemState = StoreMenuItem & { visible: boolean };

type MenuManagerProps = { items: StoreMenuItem[] };

function toMenuState(items: StoreMenuItem[]): MenuItemState[] {
  return items.map((item) => ({ ...item, visible: true }));
}

function MenuImagePreview({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="admin-menu-preview">
      {src ? (
        isInlineImageSrc(src) ? (
          <FlexibleImageFill
            src={src}
            alt={alt}
            sizes="120px"
            className="admin-photo-preview-img object-cover"
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="120px"
            className="admin-photo-preview-img"
          />
        )
      ) : (
        <div className="admin-menu-preview-empty">
          <Upload size={20} strokeWidth={1.5} />
          <span>写真未設定</span>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({
  item,
  index,
  total,
  placeholder,
  onChange,
  onDelete,
  onMove,
}: {
  item: MenuItemState;
  index: number;
  total: number;
  placeholder: string;
  onChange: (id: string, patch: Partial<MenuItemState>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  return (
    <div className="admin-card admin-menu-card">
      <div className="admin-menu-drag-hint">
        <GripVertical size={14} strokeWidth={1.75} />
        おすすめ順に並び替えできます
      </div>
      <div className="admin-menu-card-layout">
        <button type="button" className="admin-menu-grip" aria-label="並び替え">
          <GripVertical size={18} strokeWidth={1.75} />
        </button>
        <MenuImagePreview src={item.imageUrl} alt={item.name} />
        <div className="admin-menu-card-fields">
          <div className="admin-menu-card-head">
            <input
              type="text"
              className="admin-form-input admin-menu-name-input"
              value={item.name}
              placeholder="メニュー名"
              onChange={(e) => onChange(item.id, { name: e.target.value })}
            />
            <input
              type="text"
              className="admin-form-input admin-menu-price-input"
              value={item.price}
              placeholder="¥2,400"
              onChange={(e) => onChange(item.id, { price: e.target.value })}
            />
          </div>
          <textarea
            className="admin-form-textarea admin-menu-desc-input"
            value={item.description ?? ""}
            placeholder={placeholder}
            rows={2}
            onChange={(e) =>
              onChange(item.id, { description: e.target.value })
            }
          />
          <label className="admin-menu-visible">
            <input
              type="checkbox"
              checked={item.visible}
              onChange={(e) =>
                onChange(item.id, { visible: e.target.checked })
              }
            />
            サイトに表示する
          </label>
        </div>
      </div>
      <div className="admin-menu-card-actions">
        <button type="button" className="admin-btn admin-btn--secondary">
          <Upload size={14} strokeWidth={1.75} />
          画像を変更
        </button>
        <div className="admin-menu-sort-actions">
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--icon"
            disabled={index === 0}
            onClick={() => onMove(item.id, "up")}
            aria-label="上へ"
          >
            ↑
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost admin-btn--icon"
            disabled={index === total - 1}
            onClick={() => onMove(item.id, "down")}
            aria-label="下へ"
          >
            ↓
          </button>
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-menu-delete"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 size={14} strokeWidth={1.75} />
          削除
        </button>
      </div>
    </div>
  );
}

function NewMenuCard({
  onAdd,
  onCancel,
}: {
  onAdd: (item: Omit<MenuItemState, "sortOrder">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(true);

  return (
    <div className="admin-card admin-menu-card admin-menu-card--new">
      <p className="admin-menu-new-title">新しいメニューを追加</p>
      <div className="admin-menu-card-layout">
        <div className="admin-menu-preview admin-menu-preview--upload">
          <button type="button" className="admin-menu-upload-btn">
            <Upload size={20} strokeWidth={1.5} />
            <span>画像を追加</span>
          </button>
        </div>
        <div className="admin-menu-card-fields">
          <div className="admin-menu-card-head">
            <input
              type="text"
              className="admin-form-input"
              placeholder="メニュー名"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              className="admin-form-input admin-menu-price-input"
              placeholder="¥2,400"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <textarea
            className="admin-form-textarea"
            placeholder="毎朝仕入れた鮮魚を使用しています"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="admin-menu-visible">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
            />
            サイトに表示する
          </label>
        </div>
      </div>
      <div className="admin-menu-card-actions">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={() => {
            if (!name.trim()) return;
            onAdd({
              id: `menu-new-${Date.now()}`,
              name: name.trim(),
              price: price.trim() || "¥0",
              description: description.trim() || undefined,
              imageUrl: "",
              visible,
            });
          }}
          disabled={!name.trim()}
        >
          追加する
        </button>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={onCancel}>
          キャンセル
        </button>
      </div>
    </div>
  );
}

export function MenuManager({ items }: MenuManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItemState[]>(() =>
    toMenuState(items)
  );
  const [adding, setAdding] = useState(false);

  const handleChange = (id: string, patch: Partial<MenuItemState>) => {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleDelete = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    setMenuItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index < 0) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, i) => ({ ...item, sortOrder: i + 1 }));
    });
  };

  const canAdd = menuItems.length < MENU_MAX_ITEMS;

  return (
    <DirtyForm className="admin-menu-manager">
      <div className="admin-card admin-menu-summary">
        <p className="admin-menu-summary-count">
          {getMenuCountLabel(menuItems.length)}
        </p>
        <p className="admin-menu-summary-desc">
          メニュー写真と価格を登録すると、サイトの訴求力が高まります。
        </p>
      </div>

      <div className="admin-menu-list">
        {menuItems.map((item, index) => (
          <MenuItemCard
            key={item.id}
            item={item}
            index={index}
            total={menuItems.length}
            placeholder={DESC_PLACEHOLDERS[index % DESC_PLACEHOLDERS.length]}
            onChange={handleChange}
            onDelete={handleDelete}
            onMove={handleMove}
          />
        ))}
      </div>

      {adding ? (
        <NewMenuCard
          onAdd={(item) => {
            setMenuItems((prev) => [
              ...prev,
              { ...item, sortOrder: prev.length + 1 },
            ]);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        canAdd && (
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-menu-add-btn"
            onClick={() => setAdding(true)}
          >
            <Plus size={16} strokeWidth={1.75} />
            新しいメニューを追加
          </button>
        )
      )}

      <SaveBar />
    </DirtyForm>
  );
}
