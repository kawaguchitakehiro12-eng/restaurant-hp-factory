"use client";

import { Plus } from "lucide-react";
import { DirtyForm } from "@/components/admin/DirtyForm";
import { FormField } from "@/components/admin/FormField";
import { SaveBar } from "@/components/admin/SaveBar";
import type { StoreTopic } from "@/types/store";

type TopicsManagerProps = { topics: StoreTopic[] };

export function TopicsManager({ topics }: TopicsManagerProps) {
  return (
    <DirtyForm className="admin-topics-manager">
      <div className="admin-notice admin-notice--info">
        <p className="text-xs">
          デザインは固定です。お知らせのテキストのみ編集できます。
        </p>
      </div>

      <div className="admin-topics-list">
        {topics.map((topic) => (
          <div key={topic.id} className="admin-card admin-topic-card">
            <div className="admin-form-grid admin-form-grid--3">
              <FormField label="日付" hint="例：2026.06">
                <input
                  type="text"
                  className="admin-form-input"
                  defaultValue={topic.date}
                  placeholder="2026.06"
                />
              </FormField>
              {topic.category !== undefined && (
                <FormField label="カテゴリ">
                  <input
                    type="text"
                    className="admin-form-input"
                    defaultValue={topic.category ?? ""}
                    placeholder="お知らせ"
                  />
                </FormField>
              )}
            </div>
            <FormField label="タイトル" hint="例：初夏の限定コースのご案内">
              <input
                type="text"
                className="admin-form-input"
                defaultValue={topic.title}
                placeholder="初夏の限定コースのご案内"
              />
            </FormField>
          </div>
        ))}
      </div>

      <button type="button" className="admin-btn admin-btn--secondary admin-topics-add">
        <Plus size={16} strokeWidth={1.75} />
        トピックスを追加
      </button>

      <SaveBar />
    </DirtyForm>
  );
}
