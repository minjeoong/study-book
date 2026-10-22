---
title: RNN과 LSTM
en: Recurrent Neural Network, Long Short-Term Memory
summary: "이전 시점의 Hidden State를 현재 입력과 합쳐 순서를 기억하는 RNN, Cell State와 3개 Gate로 장기 기억을 지키는 LSTM"
importance: 3
order: 10
tags: [RNN, LSTM, Hidden State, Cell State, Gate, BPTT, 시계열]
keypoints:
  - "hₜ = tanh(W_hh·hₜ₋₁ + W_xh·xₜ + b) — 같은 가중치를 모든 시점에 공유"
  - "길어지면 BPTT에서 기울기 소실 → 먼 과거를 잊음 (장기 의존성 문제)"
  - "LSTM은 Cell State(정보 고속도로) + Forget·Input·Output Gate로 기억 취사선택"
qa:
  - q: "RNN에서 가중치를 시점마다 공유하는 이유는?"
    a: "규칙은 시점과 무관하다는 귀납적 편향 때문입니다. 같은 셀을 매 시점 재사용하면 시퀀스 길이와 상관없이 파라미터 수가 고정되고(T = 10, hidden 128, input 64일 때 공유하지 않으면 약 24.6만 개, 공유하면 약 2.5만 개), 길이가 다른 입력도 같은 규칙으로 처리할 수 있습니다. 순서대로 처리하며 이전 요약을 다음 시점에 넘기므로 순서가 바뀌면 의미가 바뀌는 데이터를 다룰 수 있습니다."
  - q: "LSTM은 RNN의 어떤 문제를 어떻게 해결하나요?"
    a: "RNN은 Hidden State 하나에 과거를 계속 덮어쓰고, 시간 축 역전파(BPTT)에서 기울기가 시점마다 곱해지며 소실되어 오래된 정보를 잃습니다. LSTM은 Hidden State와 별도로 Cell State라는 정보 고속도로를 두고, Forget Gate로 버릴 기억을, Input Gate로 새로 저장할 정보를, Output Gate로 내보낼 정보를 데이터로 학습해 정합니다. 다만 계산량이 많고 여전히 순차 처리라 병렬화가 어려워, 긴 시퀀스 문제는 Attention의 등장 배경이 됐습니다."
  - q: "시계열 데이터를 나눌 때 주의할 점은?"
    a: "시간 순서대로 train, valid, test를 먼저 나누고 스케일러는 train 구간에만 fit해야 합니다. 전체 데이터에 먼저 스케일링하면 test 구간 통계가 학습에 새어 들어가고, 슬라이딩 윈도우를 먼저 만든 뒤 자르면 경계에서 윈도우가 겹칩니다. 실습 개선판(31)에서는 이 누수를 없애고 결측 마커 -200을 0이 아닌 시간 보간으로 처리해 원 스케일 Test RMSE를 0.62에서 0.56으로 낮췄습니다."
related: [activation-loss-functions, autoencoder-seq2seq, transformer-bert, llm-transformer/language-model-rnn]
source: "Day3 슬라이드 p.29–47 (Recurrent 일기 비유, RNN Hidden State, 다양한 구성, BPTT, Softmax in RNN, RNN with tanh, LSTM, LSTM Gates, RNN vs LSTM, 귀납적 편향 요약), 실습 30·31-lstm (UCI Air Quality CO 예측)"
---

```formula
hₜ = tanh(W_hh · hₜ₋₁ + W_xh · xₜ + b_h) :: 이전 상태 + 현재 입력 → 새 상태
yₜ = W_hy · hₜ + b_y :: 현재 상태에서 출력
cₜ = f ⊙ cₜ₋₁ + i ⊙ g :: LSTM, 과거 기억 일부 유지(f) + 새 정보 반영(i)
hₜ = o ⊙ tanh(cₜ) :: LSTM, 기억에서 필요한 만큼(o) 꺼내 출력
```

```compare
RNN | LSTM
비유 | 매일 쓰는 일기 | 일기 + 중요 메모장
상태 | Hidden State 하나 | Cell State(장기 기억) + Hidden State(현재)
조절 | tanh로 단순 계산 | Forget · Input · Output Gate
한계 | 긴 시퀀스에서 기울기 소실 | 계산량 많음, 순차 처리라 병렬화 한계
```

```python
class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=50, num_layers=2, dropout=0.2):
        super().__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers,
                            batch_first=True, dropout=dropout)  # (batch, seq, feature)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):              # x: (batch, 24, 1) = 과거 24시간
        out, _ = self.lstm(x)
        return self.fc(out[:, -1, :])  # 마지막 시점 hidden → 다음 1시간 CO
```

> [!tip] 구성 방식
> One-to-Many(이미지 캡션), Many-to-One(실습처럼 24시간 → 1개 예측), Many-to-Many(번역)로 입출력 길이를 자유롭게 설계. 시계열 회귀는 Softmax 없이 MSE, 텍스트 다음 단어 예측은 Softmax + Cross Entropy.
