export function NotFound() {
  return (
    <div className="page">
      <h1 className="page-title">찾는 페이지가 없어요</h1>
      <p className="page-sub">주소가 바뀌었거나 아직 정리되지 않은 노트예요.</p>
      <p style={{ marginTop: 24 }}>
        <a className="btn btn--primary" href="#/">
          홈으로
        </a>
      </p>
    </div>
  )
}
