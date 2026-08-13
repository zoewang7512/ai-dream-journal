import { useState } from "react";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { Select } from "../Select/Select";
import { Checkbox } from "../Checkbox/Checkbox";
import { RadioGroup } from "../RadioGroup/RadioGroup";
import { Card } from "../Card/Card";
import { Modal } from "../Modal/Modal";
import { Toast } from "../Toast/Toast";
import { FormField } from "../FormField/FormField";
import styles from "./ComponentGallery.module.css";

const MOOD_OPTIONS = [
  { value: "happy", label: "開心" },
  { value: "scared", label: "害怕" },
  { value: "confused", label: "困惑" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "草稿" },
  { value: "completed", label: "已完成" },
];

export function ComponentGallery() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(true);

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>元件庫 Gallery（S4 驗證用）</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Button</h2>
        <div className={styles.row}>
          <Button variant="primary">主要按鈕</Button>
          <Button variant="ghost">次要按鈕</Button>
          <Button variant="danger">危險按鈕</Button>
        </div>
        <div className={styles.row}>
          <Button variant="primary" loading>
            載入中
          </Button>
          <Button variant="primary" disabled>
            停用
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Input</h2>
        <div className={styles.row}>
          <div className={styles.controlWidth}>
            <span className={styles.stateLabel}>default</span>
            <Input aria-label="夢境標題" placeholder="幫這篇夢境取個名字" />
          </div>
          <div className={styles.controlWidth}>
            <span className={styles.stateLabel}>error</span>
            <Input aria-label="夢境標題" defaultValue="" error="標題不可為空" />
          </div>
          <div className={styles.controlWidth}>
            <span className={styles.stateLabel}>disabled</span>
            <Input aria-label="夢境標題" defaultValue="森林裡的燈籠" disabled />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Select</h2>
        <div className={styles.row}>
          <div className={styles.controlWidth}>
            <span className={styles.stateLabel}>default</span>
            <Select options={MOOD_OPTIONS} placeholder="選擇心情" aria-label="心情" />
          </div>
          <div className={styles.controlWidth}>
            <span className={styles.stateLabel}>disabled</span>
            <Select options={MOOD_OPTIONS} aria-label="心情" disabled />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Checkbox</h2>
        <div className={styles.row}>
          <Checkbox label="標記為已完成" />
          <Checkbox label="已勾選" defaultChecked />
          <Checkbox label="停用" disabled />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>RadioGroup</h2>
        <div className={styles.row}>
          <RadioGroup options={STATUS_OPTIONS} aria-label="狀態" defaultValue="draft" />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Card</h2>
        <div className={styles.row}>
          <Card>
            <p style={{ margin: 0 }}>一般卡片（不可點擊）</p>
          </Card>
          <Card onClick={() => {}}>
            <p style={{ margin: 0 }}>可點擊卡片（hover 會浮起）</p>
          </Card>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>FormField（Form 組合）</h2>
        <div className={styles.row} style={{ width: "100%" }}>
          <div className={styles.controlWidth}>
            <FormField id="gallery-date" label="日期" required hint="格式：YYYY-MM-DD">
              <Input id="gallery-date" placeholder="2026-08-13" />
            </FormField>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Modal / Dialog</h2>
        <div className={styles.row}>
          <Button variant="ghost" onClick={() => setModalOpen(true)}>
            開啟刪除確認 Modal
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onOpenChange={setModalOpen}
          title="刪除這篇日記？"
          description="刪除後無法復原，AI 分析結果與插圖也會一併移除。"
          actions={
            <>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                取消
              </Button>
              <Button variant="danger" onClick={() => setModalOpen(false)}>
                確定刪除
              </Button>
            </>
          }
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Toast / Alert</h2>
        <div className={styles.row}>
          <Button variant="ghost" onClick={() => setToastOpen(true)}>
            重新顯示 Toast
          </Button>
        </div>
        <Toast
          open={toastOpen}
          onOpenChange={setToastOpen}
          variant="success"
          title="已儲存這篇夢境日記"
          description="你可以隨時回來繼續編輯。"
        />
      </section>
    </div>
  );
}
