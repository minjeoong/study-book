export function NotFound() {
  return (
    <section className="notice" style={{ marginTop: 24 }}>
      <h1 className="title title--md">찾는 역이 없어요</h1>
      <p>주소가 바뀌었거나 아직 정리되지 않은 노트예요.</p>
      <p style={{ marginTop: 20 }}>
        <a className="btn btn--go" href="#/">
          운행표로 돌아가기
        </a>
      </p>
    </section>
  )
}
