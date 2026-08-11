export default function Loading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#070910",
        color: "#f8fafc",
        fontFamily: "Arial, Helvetica, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        {/* Spinner */}
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            border: "4px solid #252a36",
            borderTop: "4px solid #8b5cf6",
            borderRight: "4px solid #8b5cf6",
            animation: "careerMatchSpin 0.8s linear infinite",
            marginBottom: "20px",
            boxSizing: "border-box",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: "17px",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          Loading Career Match...
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: "#71809a",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          Analyzing your career profile
        </div>
      </div>

      {/* Spinner Animation */}
      <style>{`
        @keyframes careerMatchSpin {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}