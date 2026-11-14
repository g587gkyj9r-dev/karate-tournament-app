
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
const [showParticipantForm, setShowParticipantForm] = useState(false);
const [showFinals, setShowFinals] = useState(false);
const [participantName, setParticipantName] = useState("");
const [division, setDivision] = useState("");
const [part, setPart] = useState("第1部");
  const [groupname, setGroupname] = useState("前半");
  const [selectedPart, setSelectedPart] = useState("第1部");
  const [selectedGroup, setSelectedGroup] = useState("前半");
const [bibNumber, setBibNumber] = useState("");
const [court, setCourt] = useState("");

  const [round1Color, setRound1Color] = useState("");
  const [round1Order, setRound1Order] = useState("");
  const [round2Color, setRound2Color] = useState("");
  const [round2Order, setRound2Order] = useState("");
  const [round3Color, setRound3Color] = useState("");
  const [round3Order, setRound3Order] = useState("");
  const [round4Color, setRound4Color] = useState("");
  const [round4Order, setRound4Order] = useState("");
  const [finalColor, setFinalColor] = useState("");
  const [finalOrder, setFinalOrder] = useState("");
  const [finalCourt, setFinalCourt] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setLoginError(error.message);
      } else {
        setSession(data.session);
      }

      setAuthLoading(false);
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login() {
    setLoginError("");

    if (!email.trim() || !password) {
      setLoginError("メールアドレスとパスワードを入力してください");
      return;
    }

    const loginEmail = email.trim() === "motokariyagroup"
  ? "motokariyagroup@karate.local"
  : email.trim();

const { error } = await supabase.auth.signInWithPassword({
  email: loginEmail,
  password,
});

    if (error) {
      setLoginError("ログインできませんでした：" + error.message);
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("ログアウトできませんでした：" + error.message);
    }
  }

  async function loadTournaments() {
    setLoading(true);

    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) {
      alert("大会データを読み込めませんでした：" + error.message);
    } else {
      setTournaments(data || []);
    }

    setLoading(false);
  }

async function loadParticipants(tournamentId) {
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("tournament_id", tournamentId);

  if (error) {
    alert("参加者データの読み込みに失敗しました：" + error.message);
  } else {
    setParticipants(data || []);
  }
}

  async function updateMatchStatus(participantId, newStatus) {
    const { error } = await supabase
      .from("participants")
      .update({ match_status: newStatus })
      .eq("id", participantId);

    if (error) {
      alert("試合状況を更新できませんでした：" + error.message);
      return;
    }

    setParticipants((prevParticipants) =>
      prevParticipants.map((participant) =>
        participant.id === participantId
          ? { ...participant, match_status: newStatus }
          : participant
      )
    );
  }

  async function addParticipant() {
    if (!participantName.trim() || !division.trim()) {
      alert("部門と名前を入力してください");
      return;
    }
     alert("入力値：" + round1Order);
     alert("入力値の型：" + typeof round1Order);
    const { error } = await supabase
      .from("participants")
      .insert([
        {
          tournament_id: selectedTournament.id,
          division: division.trim(),
          part: part,
          group_name: groupname,
          name: participantName.trim(),
          bib_number: bibNumber.trim(),
          court: court.trim(),
          round1_color: round1Color || null,
          round1_order: round1Order ? Number(round1Order) : null,
          round2_color: round2Color || null,
          round2_order: round2Order ? Number(round2Order) : null,
          round3_color: round3Color || null,
          round3_order: round3Order ? Number(round3Order) : null,
          round4_color: round4Color || null,
          round4_order: round4Order ? Number(round4Order) : null,
          final_color: finalColor || null,
          final_order: finalOrder ? Number(finalOrder) : null,
          final_court: finalCourt.trim(),

        },
      ]);

    if (error) {
      alert("参加者を登録できませんでした：" + error.message);
      return;
    }

    setParticipantName("");
    setDivision("");
    setBibNumber("");
    setCourt("");
    setRound1Color("");
    setRound1Order("");
    setRound2Color("");
    setRound2Order("");
    setRound3Color("");
    setRound3Order("");
    setRound4Color("");
    setRound4Order("");
    setFinalColor("");
    setFinalOrder("");
    setFinalCourt("");

    setShowParticipantForm(false);

    loadParticipants(selectedTournament.id);
  }

  async function addTournament() {
    if (!name.trim() || !eventDate) {
      alert("大会名と開催日を入力してください");
      return;
    }

    const { error } = await supabase
      .from("tournaments")
      .insert([
        {
          name: name.trim(),
          event_date: eventDate,
          status: "開催前",
        },
      ]);

    if (error) {
      alert("登録できませんでした：" + error.message);
      return;
    }

    setName("");
    setEventDate("");
    setShowForm(false);
    loadTournaments();
  }

  useEffect(() => {
    if (session) {
      loadTournaments();
    } else {
      setTournaments([]);
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (selectedTournament) {
      loadParticipants(selectedTournament.id);
    } else {
      setParticipants([]);
    }
  }, [selectedTournament]);

    useEffect(() => {
    if (!selectedTournament) return;

    const channel = supabase
      .channel("participants-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `tournament_id=eq.${selectedTournament.id}`,
        },
        () => {
          loadParticipants(selectedTournament.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTournament]);

  if (authLoading) {
    return <div className="app">ログイン状態を確認中...</div>;
  }

  if (!session) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-title">空手大会管理システム</div>
          <div className="dojo-name">日本空手道不動会</div>
        </header>

        <main className="main">
          <div className="modal">
            <h2>指導員ログイン</h2>

            <label>ログインID</label>
            <input
              type="text"
              placeholder="ログインID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>パスワード</label>
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {loginError && (
              <p className="message">{loginError}</p>
            )}

            <button className="save-button" onClick={login}>
              ログイン
            </button>
          </div>
        </main>

        <footer className="footer">
          日本空手道不動会
        </footer>
      </div>
    );
  }
  if (selectedTournament) {
    return (
      <div className="app">
        <header className="header">
          <div className="header-title">空手大会管理システム</div>
          <div className="dojo-name">日本空手道不動会</div>
          <button onClick={logout}>ログアウト</button>
        </header>

        <main className="main">
          <button
            className="cancel-button"
            onClick={() => setSelectedTournament(null)}
          >
            ← 大会一覧に戻る
          </button>

          <h2>{selectedTournament.name}</h2>
          <p>開催日：{selectedTournament.event_date}</p>

          
          <div className="participant-section">
            <div className="section-header">
              <h3>参加者一覧（{participants.length}名）</h3>
              <button
                onClick={() => setShowParticipantForm(!showParticipantForm)}
              >
                ＋ 参加者を追加
              </button>
              <button
              className="final-toggle-fixed"
               onClick={() => setShowFinals(!showFinals)}
              >
              {showFinals ? "決勝戦を閉じる" : "決勝戦を表示"}
              </button>
            </div>

            {showParticipantForm && (
              <div className="participant-form">
                <h3>参加者登録</h3>
  
                <input
                type="text"
                placeholder="部門（例：小学3年男子）"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                />

                <label>出場する部</label>
                <select
                  value={part}
                  onChange={(e) => setPart(e.target.value)}
                >
                  <option value="第1部">第1部</option>
                  <option value="第2部">第2部</option>
                </select>

                <label>グループ</label>
                <select
                  value={groupname}
                  onChange={(e) => setGroupname(e.target.value)}
                >
                  <option value="前半">前半</option>
                  <option value="後半">後半</option>
                </select>
                <input
                  type="text"
                  placeholder="名前"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="ゼッケン番号"
                  value={bibNumber}
                  onChange={(e) => setBibNumber(e.target.value)}
                />

                <input
                  type="text"
                  placeholder="コート"
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                />
                
                <div className="round-input">
                  <h4>1回戦</h4>

                  <button
                    type="button"
                    onClick={() => setRound1Color("赤")}
                  >
                    {round1Color === "赤" ? "🔴 ✓" : "🔴"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRound1Color("白")}
                  >
                    {round1Color === "白" ? "⚪ ✓" : "⚪"}
                  </button>

                  <input
                    type="number"
                    placeholder="試合順"
                    value={round1Order}
                    onChange={(e) => setRound1Order(e.target.value)}
                  />
                </div>


                <div className="round-input">
                  <h4>2回戦</h4>

                  <button
                    type="button"
                    onClick={() => setRound2Color("赤")}
                  >
                    {round2Color === "赤" ? "🔴 ✓" : "🔴"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRound2Color("白")}
                  >
                    {round2Color === "白" ? "⚪ ✓" : "⚪"}
                  </button>

                  <input
                    type="number"
                    placeholder="試合順"
                    value={round2Order}
                    onChange={(e) => setRound2Order(e.target.value)}
                  />
                </div>

              
                <div className="round-input">
                  <h4>3回戦</h4>

                  <button
                    type="button"
                    onClick={() => setRound3Color("赤")}
                  >
                    {round3Color === "赤" ? "🔴 ✓" : "🔴"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRound3Color("白")}
                  >
                    {round3Color === "白" ? "⚪ ✓" : "⚪"}
                  </button>

                  <input
                    type="number"
                    placeholder="試合順"
                    value={round3Order}
                    onChange={(e) => setRound3Order(e.target.value)}
                  />
                </div>

              
                <div className="round-input">
                  <h4>4回戦</h4>

                  <button
                    type="button"
                    onClick={() => setRound4Color("赤")}
                  >
                    {round4Color === "赤" ? "🔴 ✓" : "🔴"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRound4Color("白")}
                  >
                    {round4Color === "白" ? "⚪ ✓" : "⚪"}
                  </button>

                  <input
                    type="number"
                    placeholder="試合順"
                    value={round4Order}
                    onChange={(e) => setRound4Order(e.target.value)}
                  />
                </div>
                      <div className="round-input">
        <h4>決勝戦</h4>

        <button
          type="button"
          onClick={() => setFinalColor("赤")}
        >
          {finalColor === "赤" ? "🔴 ✓" : "🔴"}
        </button>

        <button
          type="button"
          onClick={() => setFinalColor("白")}
        >
          {finalColor === "白" ? "○ ✓" : "○"}
        </button>

        <input
          type="number"
          placeholder="試合順"
          value={finalOrder}
          onChange={(e) => setFinalOrder(e.target.value)}
        />

        <input
          type="text"
          placeholder="コート"
          value={finalCourt}
          onChange={(e) => setFinalCourt(e.target.value)}
        />
      </div>

                <button onClick={addParticipant}>登録する</button>
                <button onClick={() => setShowParticipantForm(false)}>
                  キャンセル
                </button>
              </div>
            )}

            {participants.length === 0 ? (
              <p>参加者はまだ登録されていません。</p>
            ) : (
             <> 
            <div className="participant-filter">
              <select
                value={selectedPart}
                onChange={(e) => setSelectedPart(e.target.value)}
              >
                <option value="第1部">第1部</option>
                <option value="第2部">第2部</option>
              </select>

              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="前半">前半</option>
                <option value="後半">後半</option>
              </select>
            </div>

            
              <div style={{ overflowX: "auto", width: "100%" }}>
                <table style={{
                  minWidth: "900px",
                  width: "100%",
                  borderCollapse: "collapse",
                  whiteSpace: "nowrap"
                }}>
                  <thead>
  <tr>
    <th>部門</th>
    <th>ゼッケン</th>
    <th>名前</th>
    <th>コート</th>
    <th>1回戦</th>
    <th>2回戦</th>
    <th>3回戦</th>
    <th>4回戦</th>
    <th>試合状況</th>
  </tr>
</thead>

                  <tbody>
                    {participants
                      .filter(
                        (participant) =>
                          participant.part === selectedPart &&
                          participant.group_name === selectedGroup
                      )
                      .map((participant) => (
                        <tr key={participant.id}>
                          <td>{participant.division}</td>
                          <td>{participant.bib_number || "未設定"}</td>
                          <td>{participant.name}</td>
                          <td>{participant.court || "未設定"}</td>
                          <td>
  {participant.round1_color || "未設定"}
  {participant.round1_order ? ` ${participant.round1_order}番` : ""}
</td>
<td>
  {participant.round2_color || "未設定"}
  {participant.round2_order ? ` ${participant.round2_order}番` : ""}
</td>
<td>
  {participant.round3_color || "未設定"}
  {participant.round3_order ? ` ${participant.round3_order}番` : ""}
</td>
<td>
  {participant.round4_color || "未設定"}
  {participant.round4_order ? ` ${participant.round4_order}番` : ""}
</td>
                          <td>
                            <select
                              value={participant.match_status || "1回戦待ち"}
                              onChange={(e) =>
                                updateMatchStatus(
                                  participant.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="1回戦待ち">1回戦待ち</option>
                              <option value="1回戦勝利">1回戦勝利</option>
                              <option value="1回戦敗退">1回戦敗退</option>
                              <option value="2回戦待ち">2回戦待ち</option>
                              <option value="2回戦勝利">2回戦勝利</option>
                              <option value="2回戦敗退">2回戦敗退</option>
                              <option value="準々決勝待ち">準々決勝待ち</option>
                              <option value="準々決勝敗退">準々決勝敗退</option>
                              <option value="準決勝待ち">準決勝待ち</option>
                              <option value="準決勝敗退">準決勝敗退</option>
                              <option value="決勝進出">決勝進出</option>
                              <option value="優勝">優勝</option>
                              <option value="準優勝">準優勝</option>
                              <option value="第3位">第3位</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
             {showFinals && (
  <div className="final-section">
    <h3>決勝戦</h3>

    {[...new Set(
      participants
        .filter(
          (participant) =>
            participant.final_order != null &&
            participant.final_court.trim() !== ""
        )
        .map((participant) => participant.final_court.trim())
    )]
      .sort((a, b) => Number(a) - Number(b))
      .map((court) => (
        <div key={court} className="final-court-section">
          <h4>{court}コート</h4>

          <table>
            <thead>
              <tr>
                <th>部門</th>
                <th>ゼッケン</th>
                <th>名前</th>
                <th>試合順</th>
                <th>赤白</th>
              </tr>
            </thead>

            <tbody>
              {participants
                .filter(
                  (participant) =>
                    participant.final_order != null &&
                    participant.final_court.trim() === court
                )
                .sort(
                  (a, b) => a.final_order - b.final_order
                )
                .map((participant) => (
                  <tr key={participant.id}>
                    <td>{participant.division}</td>
                    <td>{participant.bib_number}</td>
                    <td>{participant.name}</td>
                    <td>{participant.final_order}番</td>
                    <td>{participant.final_color}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}
  </div>
)}
  
              </>
            )}

          </div>

        </main>

        <footer className="footer">
          日本空手道不動会
        </footer>
      </div>
    );
  }
  return (
    <div className="app">
      <header className="header">
        <div className="header-title">空手大会管理システム</div>
        <div className="dojo-name">日本空手道不動会</div>
        <button onClick={logout}>ログアウト</button>
      </header>

      <main className="main">
        <div className="section-heading">
          <div>
            <h2>大会一覧</h2>
            <p>管理する大会を選択してください</p>
          </div>

          <button
            className="add-button"
            onClick={() => setShowForm(true)}
          >
            ＋ 大会を追加
          </button>
        </div>

        {showForm && (
          <div className="modal-background">
            <div className="modal">
              <h2>大会を新規登録</h2>

              <label>大会名</label>
              <input
                type="text"
                placeholder="例：2027年中部大会"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label>開催日</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />

              <div className="modal-buttons">
                <button
                  className="cancel-button"
                  onClick={() => setShowForm(false)}
                >
                  キャンセル
                </button>

                <button
                  className="save-button"
                  onClick={addTournament}
                >
                  登録する
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <p className="message">大会データを読み込み中...</p>
        ) : tournaments.length === 0 ? (
          <div className="empty">
            <p>まだ大会が登録されていません。</p>
            <p>「大会を追加」から登録してください。</p>
          </div>
        ) : (
          <div className="tournament-list">
            {tournaments.map((tournament) => (
              <div
  className="tournament-card"
  key={tournament.id}
  onClick={() => setSelectedTournament(tournament)}
  style={{ cursor: "pointer" }}
>

                <div>
                  <span className="status">
                    {tournament.status || "開催前"}
                  </span>
                  <h3>{tournament.name}</h3>
                  <p>
                    開催日：
                    {tournament.event_date || "未設定"}
                  </p>
                </div>
                <span className="arrow">›</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        日本空手道不動会
      </footer>
    </div>
  );
}

export default App;
