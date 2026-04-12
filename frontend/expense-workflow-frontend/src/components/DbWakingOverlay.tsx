type Props = {
  isVisible: boolean;
};

const DbWakingOverlay = ({ isVisible }: Props) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        color: "white",
        gap: "12px",
      }}
    >
      <p style={{ fontSize: "1.1rem" }}>⏳ サーバーを起動中です...</p>
      <p style={{ fontSize: "0.85rem", opacity: 0.75 }}>
        初回アクセス時は最大60秒かかる場合があります
      </p>
    </div>
  );
};

export default DbWakingOverlay;
