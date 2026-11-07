import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Activity, BookOpen, Brain, CalendarDays, Check, ChevronRight, Cpu, Crown, Flame, Gamepad2, GraduationCap, Lightbulb, Menu, RotateCcw, Sparkles, Target, Trophy, Undo2, X } from 'lucide-react';
import { Chess } from 'chess.js';
import ChessBoard from './components/ChessBoard';
import { dailyMissions, modules, openings, type Module } from './data/content';
import { puzzles } from './data/puzzles';
import { lessonContent } from './data/lesson-content';
import { playerLevel, readProgress, writeProgress, recordLessonComplete, recordLessonReview, recordPuzzleSolve, recordPracticeMove, getDueReviewCards, type ProgressState } from './lib/progress';
import type { ReviewGrade } from './lib/spaced-repetition';
import { StockfishClient, type EngineInfo } from './lib/stockfish-client';

type Tab = 'home'|'learn'|'puzzles'|'openings'|'play'|'progress';
const navigation: {id:Tab;label:string;icon:typeof Activity}[] = [
  {id:'home',label:'Overview',icon:Activity},{id:'learn',label:'Academy',icon:GraduationCap},
  {id:'puzzles',label:'Tactics lab',icon:Target},{id:'openings',label:'Opening library',icon:BookOpen},
  {id:'play',label:'Practice board',icon:Gamepad2},{id:'progress',label:'My progress',icon:Trophy},
];

export default function App() {
  const [tab,setTab]=useState<Tab>('home');
  const [progress,setProgress]=useState<ProgressState>(()=>readProgress());
  const [lesson,setLesson]=useState<Module|null>(null);
  const [mobile,setMobile]=useState(false);
  const [notice,setNotice]=useState('');
  const level=playerLevel(progress.xp);
  useEffect(()=>writeProgress(progress),[progress]);
  const navigate=(next:Tab)=>{setTab(next);setMobile(false);setLesson(null);setNotice('');};
  function finishLesson(item:Module,grade:ReviewGrade){
    const alreadyDone=progress.completedLessons.includes(item.id);
    setProgress(p=>alreadyDone
      ? recordLessonReview(p,item.id,grade)
      : recordLessonComplete(p,item.id,item.xp,new Date(),grade));
    setNotice(alreadyDone
      ? 'Review saved. Your next review has been scheduled.'
      : 'Lesson completed. '+item.xp+' XP earned.');
    setLesson(null);
  }
  function recordPuzzle(id:string,seconds:number){
    const alreadyEarned=progress.solvedPuzzles.includes(id);
    const solvedToday=progress.dailySolvedPuzzles.includes(id);
    setProgress(p=>recordPuzzleSolve(p,id,seconds));
    setNotice(alreadyEarned
      ? (solvedToday?'Correct. Try a different position to advance today’s puzzle mission.':'Correct. This position was already recorded in your lifetime progress.')
      : 'Puzzle solved. +80 XP.');
  }
  function recordMove(){
    setProgress(p=>recordPracticeMove(p));
  }
  return <div className="app-shell">
    <aside className={`sidebar ${mobile?'sidebar-open':''}`}>
      <div className="brand"><span className="brand-mark"><Crown/></span><span><b>CHESSFORGE</b><small>THE CHESS ACADEMY</small></span><button className="icon mobile-close" onClick={()=>setMobile(false)} aria-label="Close menu"><X/></button></div>
      <div className="nav-label">YOUR TRAINING SPACE</div>
      <nav>{navigation.map(n=>{const Icon=n.icon;return <button key={n.id} className={`nav-item ${tab===n.id?'active':''}`} onClick={()=>navigate(n.id)}><Icon/><span>{n.label}</span>{tab===n.id&&<i/>}</button>;})}</nav>
      <div className="sidebar-bottom"><div className="coach-card"><Brain/><b>Your chess journey</b><p>Every session builds your personal skill history.</p><button onClick={()=>navigate('progress')}>View progress <ChevronRight/></button></div><small className="system-label"><i/> LEARNING SYSTEM · V0.1</small></div>
    </aside>
    {mobile&&<button className="scrim" onClick={()=>setMobile(false)} aria-label="Close navigation"/>}
    <main className="main"><header className="topbar"><button className="icon mobile-menu" onClick={()=>setMobile(true)} aria-label="Open menu"><Menu/></button><div className="crumb">ACADEMY <ChevronRight/> <b>{navigation.find(n=>n.id===tab)?.label.toUpperCase()}</b></div><div className="top-actions"><span className="streak"><Flame/> {progress.streak} day streak</span><span className="xp"><Sparkles/> {progress.xp.toLocaleString()} XP</span><button className="avatar" onClick={()=>navigate('progress')} aria-label="Open profile">J</button></div></header>
      {notice&&<div className="notice"><Check/>{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss notice"><X/></button></div>}
      <div className="page-content">
        {tab==='home'&&<HomePage progress={progress} level={level} navigate={navigate} openLesson={setLesson}/>}
        {tab==='learn'&&<LearnPage progress={progress} openLesson={setLesson}/>}
        {tab==='puzzles'&&<PuzzlePage onSolved={recordPuzzle}/>}
        {tab==='openings'&&<OpeningsPage/>}
        {tab==='play'&&<PlayPage onMove={recordMove}/>}
        {tab==='progress'&&<ProgressPage progress={progress} level={level} navigate={navigate}/>}
      </div>
      <footer className="footer"><span>CHESSFORGE · BUILD YOUR CHESS MIND</span><span>Practice with purpose. Improve with proof.</span></footer>
    </main>
    {lesson&&<LessonModal module={lesson} alreadyDone={progress.completedLessons.includes(lesson.id)} close={()=>setLesson(null)} complete={(grade)=>finishLesson(lesson,grade)}/>}
  </div>;
}

function PageTitle({eyebrow,title,subtitle}:{eyebrow:string;title:string;subtitle:string}){return <div className="page-title"><small>{eyebrow}</small><h1>{title}</h1><p>{subtitle}</p></div>;}
function Stat({label,value,detail,icon}:{label:string;value:string;detail:string;icon:ReactNode}){return <div className="stat-card"><span>{icon}</span><small>{label}</small><b>{value}</b><em>{detail}</em></div>;}
function CourseCard({item,index,done,onClick}:{item:Module;index:number;done:boolean;onClick:()=>void}){return <button className="course-card" onClick={onClick}><div className={`course-art tone-${index%4}`}><small>0{index+1} · {item.category}</small><strong>{['♙','♘','♗','♖','♕','♔'][index%6]}</strong>{done&&<i><Check/> MASTERED</i>}</div><div className="course-info"><small>{item.level} · {item.minutes} MIN</small><h3>{item.title}</h3><p>{item.subtitle}</p><footer>✦ {item.xp} XP <span>Explore <ChevronRight/></span></footer></div></button>;}

function DueReviewPanel({progress,openLesson}:{progress:ProgressState;openLesson:(m:Module)=>void}) {
  const due=getDueReviewCards(progress);
  const items=due.map(card=>({card,module:modules.find(item=>item.id===card.lessonId)})).filter((item):item is {card:typeof due[number];module:Module}=>Boolean(item.module));
  if(!items.length) return null;
  return <section className="section review-section">
    <header><div><small>SPACED RETRIEVAL</small><h2>Ready for a quick review?</h2></div><span className="pill">{items.length} DUE</span></header>
    <div className="review-grid">
      {items.slice(0,3).map(({card,module})=><button className="review-card" key={module.id} onClick={()=>openLesson(module)}>
        <span className="review-icon"><Brain/></span>
        <span className="review-copy"><b>{module.title}</b><small>{card.intervalDays===1?'Short recall interval':'Last interval: '+card.intervalDays+' days'} · {card.lapses} retries</small></span>
        <span className="review-action">Review <ChevronRight/></span>
      </button>)}
    </div>
    <p className="review-note">Recall the idea before reopening the explanation. Your rating after the questions sets the next review interval.</p>
  </section>;
}

type HomeProps={progress:ProgressState;level:ReturnType<typeof playerLevel>;navigate:(tab:Tab)=>void;openLesson:(m:Module)=>void};
function HomePage({progress,level,navigate,openLesson}:HomeProps){
  const featured=modules.find(m=>!progress.completedLessons.includes(m.id))??modules[0];
  return <>
    <section className="hero"><div className="hero-copy"><small>YOUR NEXT MOVE STARTS HERE</small><h1>Think deeper.<br/><i>Play stronger.</i></h1><p>A smarter way to master chess. Build your skills one idea, one position, and one good decision at a time.</p><div><button className="btn primary" onClick={()=>openLesson(featured)}>Continue learning <ChevronRight/></button><button className="btn subtle" onClick={()=>navigate('puzzles')}><Target/> Jump into tactics</button></div></div><div className="hero-piece">♛<small>E4 · D5 · C6</small></div><footer><span>● YOUR PERSONAL CHESS ACADEMY</span><span>01 / DAILY TRAINING</span></footer></section>
    <section className="welcome"><div><small>YOUR DEVELOPMENT</small><h2>Welcome back, Scholar.</h2><p>Small, focused sessions add up to stronger chess.</p></div><span><CalendarDays/> {new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</span></section>
    <div className="stats"><Stat label="ACADEMY LEVEL" value={String(level.level).padStart(2,'0')} detail={level.title} icon={<Crown/>}/><Stat label="TOTAL EXPERIENCE" value={progress.xp.toLocaleString()} detail="XP earned" icon={<Sparkles/>}/><Stat label="LESSONS MASTERED" value={String(progress.completedLessons.length).padStart(2,'0')} detail={`of ${modules.length} available`} icon={<BookOpen/>}/><Stat label="TACTICS SOLVED" value={String(progress.solvedPuzzles.length).padStart(2,'0')} detail="unique positions" icon={<Target/>}/></div>
    <DueReviewPanel progress={progress} openLesson={openLesson}/>
    <section className="section"><header><div><small>A LITTLE PRACTICE, EVERY DAY</small><h2>Today's missions</h2></div><button className="text-link" onClick={()=>navigate('progress')}>Your progress <ChevronRight/></button></header><div className="missions">{dailyMissions.map((m,i)=>{const amount=m.kind==='puzzles'?progress.dailyPuzzleCount:m.kind==='lesson'?progress.dailyLessonCount:progress.dailyMoveCount;const done=progress.completedMissions.includes(m.id);return <button className={`mission ${done?'complete':''}`} key={m.id} onClick={()=>navigate(m.kind==='puzzles'?'puzzles':m.kind==='lesson'?'learn':'play')}><div className="mission-top"><span>{i===0?<Target/>:i===1?<Lightbulb/>:<Gamepad2/>}</span><b>+{m.reward} XP</b></div><strong>{m.title}</strong><p>{m.detail}</p><div className="progress-line"><i><b style={{width:`${done?100:Math.min(100,amount/m.goal*100)}%`}}/></i><small>{done?'DONE':`${Math.min(amount,m.goal)}/${m.goal}`}</small></div></button>;})}</div></section>
    <section className="continue"><span>♞</span><div><small>PICK UP WHERE YOU LEFT OFF</small><h3>{featured.title}</h3><p>{featured.subtitle}. A focused lesson with practical checkpoints.</p><em>{featured.minutes} MIN · +{featured.xp} XP · {featured.level}</em></div><button onClick={()=>openLesson(featured)} aria-label="Open lesson"><ChevronRight/></button></section>
    <section className="section"><header><div><small>EXPLORE THE ACADEMY</small><h2>Choose your next skill</h2></div><button className="text-link" onClick={()=>navigate('learn')}>All courses <ChevronRight/></button></header><div className="courses">{modules.slice(0,3).map((m,i)=><CourseCard key={m.id} item={m} index={i} done={progress.completedLessons.includes(m.id)} onClick={()=>openLesson(m)}/>)}</div></section>
  </>;
}

function LearnPage({progress,openLesson}:{progress:ProgressState;openLesson:(m:Module)=>void}){const [filter,setFilter]=useState('All');const categories=['All','Foundations','Tactics','Calculation','Strategy','Endgames'];const visible=modules.filter(m=>filter==='All'||m.category===filter);return <><PageTitle eyebrow="THE LEARNING PATH" title="Build your chess foundation." subtitle="Short, focused lessons. Useful ideas. Skills that carry into your games."/><div className="learning-callout"><GraduationCap/><div><b>Your academy is growing.</b><p>Complete lessons to build your skill history. Interactive examples and spaced review are planned next.</p></div><strong>{progress.completedLessons.length}/{modules.length}<small>MASTERED</small></strong></div><DueReviewPanel progress={progress} openLesson={openLesson}/><div className="filters">{categories.map(c=><button key={c} className={filter===c?'selected':''} onClick={()=>setFilter(c)}>{c}</button>)}</div><div className="courses">{visible.map((m,i)=><CourseCard key={m.id} item={m} index={i} done={progress.completedLessons.includes(m.id)} onClick={()=>openLesson(m)}/>)}</div><div className="info-note"><Brain/><div><b>Mastery over memorization</b><p>Learn an idea, study the checkpoints, then test it in new positions as the curriculum expands.</p></div></div></>;}

function PuzzlePage({onSolved}:{onSolved:(id:string,seconds:number)=>void}){
  const [index,setIndex]=useState(0);const [fen,setFen]=useState(puzzles[0].fen);const [result,setResult]=useState<'ready'|'correct'|'wrong'>('ready');const [hint,setHint]=useState(false);const started=useMemo(()=>Date.now(),[index]);const puzzle=puzzles[index];
  function reset(){setFen(puzzle.fen);setResult('ready');setHint(false);}
  function move(from:string,to:string,promotion?:string){if(result!=='ready')return;const game=new Chess(fen);try{const m=game.move({from:from as never,to:to as never,promotion:(promotion??'q') as never});setFen(game.fen());if(`${m.from}${m.to}${m.promotion??''}`===puzzle.solution){setResult('correct');onSolved(puzzle.id,Math.max(1,Math.round((Date.now()-started)/1000)));}else setResult('wrong');}catch{setResult('wrong');}}
  function next(){const n=(index+1)%puzzles.length;setIndex(n);setFen(puzzles[n].fen);setResult('ready');setHint(false);}
  return <><PageTitle eyebrow="TACTICS LAB" title="Train your tactical vision." subtitle="Find the forcing idea, make the move, and understand why it works."/><div className="two-column"><section className="panel training-panel"><header><div><small>TACTICAL CHALLENGE</small><h2>{puzzle.title}</h2></div><span className="pill">{puzzle.difficulty}</span></header><div className="training-board"><ChessBoard fen={fen} onMove={move} orientation={puzzle.fen.split(' ')[1]==='b'?'b':'w'} disabled={result!=='ready'}/></div><div className="board-actions"><button className="btn secondary" onClick={reset}><RotateCcw/> Reset</button><button className="btn secondary" onClick={()=>setHint(true)} disabled={result!=='ready'}><Lightbulb/> Hint</button>{result==='correct'?<button className="btn primary" onClick={next}>Next puzzle <ChevronRight/></button>:<span>{index+1} / {puzzles.length}</span>}</div><div className={`feedback ${result}`}>{result==='correct'?<><Check/><b>Correct!</b> {puzzle.explanation}</>:result==='wrong'?<><X/><b>Not quite.</b> Reset and try again.</>:hint?<><Lightbulb/>{puzzle.hint}</>:<><Target/>Look for checks, captures, and threats. Accuracy matters more than rushing.</>}</div></section><aside className="panel side-panel"><small>WHAT YOU'RE TRAINING</small><h3>{puzzle.theme}</h3><p>Scan forcing moves. Check whether the destination square is safe. Verify the opponent's possible replies.</p><div className="tip"><Lightbulb/><b>Think in three steps</b><p>1. Find forcing moves.<br/>2. Calculate the best reply.<br/>3. Check the final position.</p></div></aside></div></>;
}

function OpeningsPage(){const [active,setActive]=useState(0);const [ply,setPly]=useState(0);const opening=openings[active];const game=useMemo(()=>{const g=new Chess();for(const san of opening.moves.slice(0,ply))g.move(san);return g;},[opening,ply]);return <><PageTitle eyebrow="OPENING LIBRARY" title="Understand the opening." subtitle="Explore a starter collection of legal move sequences. This is not yet the complete opening encyclopedia."/><div className="opening-layout"><aside className="panel opening-list"><small>STARTER COLLECTION</small>{openings.map((o,i)=><button key={o.id} className={active===i?'selected':''} onClick={()=>{setActive(i);setPly(0);}}><small>{o.eco}</small><b>{o.name}</b><span>{o.difficulty}</span></button>)}</aside><section className="panel opening-detail"><small>{opening.eco} · {opening.difficulty.toUpperCase()}</small><h2>{opening.name}</h2><p>{opening.summary}</p><div className="opening-board"><ChessBoard fen={game.fen()} onMove={()=>undefined} disabled/></div><div className="board-actions"><button className="btn secondary" disabled={!ply} onClick={()=>setPly(p=>p-1)}>Previous</button><span>{ply}/{opening.moves.length} plies</span><button className="btn secondary" disabled={ply===opening.moves.length} onClick={()=>setPly(p=>p+1)}>Next move</button><button className="btn secondary" onClick={()=>setPly(0)}>Restart</button></div><div className="move-chips">{opening.moves.map((m,i)=><button key={`${m}${i}`} className={i<ply?'played':''} onClick={()=>setPly(i+1)}>{Math.floor(i/2)+1}{i%2===0?'.':'...'} {m}</button>)}</div><h3>Ideas to understand</h3>{opening.ideas.map((idea,i)=><div className="idea" key={idea}><small>0{i+1}</small>{idea}</div>)}</section></div></>;}

const ENGINE_DIFFICULTIES = {
  casual: { label: 'Casual', movetimeMs: 250, skillLevel: 3 },
  club: { label: 'Club', movetimeMs: 650, skillLevel: 9 },
  challenge: { label: 'Challenge', movetimeMs: 1200, skillLevel: 15 },
} as const;

function formatEngineScore(info:EngineInfo|null):string {
  if(!info)return 'Waiting for the first move';
  if(info.scoreMate!==null)return 'Mate in '+Math.abs(info.scoreMate);
  if(info.scoreCp!==null){
    const score=info.scoreCp/100;
    return (score>0?'+':'')+score.toFixed(2);
  }
  return info.depth!==null?'Searching · depth '+info.depth:'Analyzing position';
}

function PlayPage({onMove}:{onMove:()=>void}){
  const [startFen,setStartFen]=useState(()=>new Chess().fen());
  const [fens,setFens]=useState([startFen]);
  const [sans,setSans]=useState<string[]>([]);
  const [orientation,setOrientation]=useState<'w'|'b'>('w');
  const [importOpen,setImportOpen]=useState(false);
  const [pgnText,setPgnText]=useState('');
  const [importError,setImportError]=useState('');
  const [importMessage,setImportMessage]=useState('');
  const [mode,setMode]=useState<'local'|'engine'>('local');
  const [humanColor,setHumanColor]=useState<'w'|'b'>('w');
  const [difficulty,setDifficulty]=useState<keyof typeof ENGINE_DIFFICULTIES>('club');
  const [engineReady,setEngineReady]=useState(false);
  const [engineStatus,setEngineStatus]=useState('Off');
  const [engineError,setEngineError]=useState('');
  const [engineInfo,setEngineInfo]=useState<EngineInfo|null>(null);
  const engineRef=useRef<StockfishClient|null>(null);
  const fen=fens[fens.length-1];
  const game=useMemo(()=>new Chess(fen),[fen]);
  const gameOver=game.isGameOver();
  const isEngineTurn=mode==='engine'&&game.turn()!==humanColor;
  const turn=game.turn()==='w'?'White':'Black';
  const status=gameOver
    ?('Checkmate — '+(game.turn()==='w'?'Black':'White')+' wins.')
    :game.isDraw()?'Draw — game ended.'
    :mode==='engine'&&isEngineTurn
      ?(engineReady?'Stockfish is thinking…':'Loading Stockfish…')
      :turn+' to move'+(game.isCheck()?' · Check':'');

  useEffect(()=>{
    if(mode!=='engine'){
      const active=engineRef.current;
      engineRef.current=null;
      active?.dispose();
      setEngineReady(false);
      setEngineStatus('Off');
      setEngineError('');
      setEngineInfo(null);
      return;
    }

    const client=new StockfishClient({onInfo:setEngineInfo,onStatus:setEngineStatus});
    engineRef.current=client;
    setEngineReady(false);
    setEngineError('');
    setEngineStatus('Loading Stockfish 18…');
    client.initialize().then(()=>{
      if(engineRef.current!==client)return;
      setEngineReady(true);
      setEngineStatus('Ready');
    }).catch(error=>{
      if(engineRef.current!==client)return;
      setEngineReady(false);
      setEngineStatus('Unavailable');
      setEngineError(error instanceof Error?error.message:'Stockfish could not be started.');
    });
    return ()=>{
      if(engineRef.current===client)engineRef.current=null;
      client.dispose();
    };
  },[mode]);

  useEffect(()=>{
    if(mode!=='engine'||!engineReady||!isEngineTurn||gameOver)return;
    const client=engineRef.current;
    if(!client)return;
    let cancelled=false;
    const settings=ENGINE_DIFFICULTIES[difficulty];
    setEngineInfo(null);
    setEngineStatus('Thinking…');
    setEngineError('');

    client.findBestMove(fen,settings.movetimeMs,settings.skillLevel).then(uci=>{
      if(cancelled)return;
      if(!uci){
        setEngineStatus('Ready');
        return;
      }
      const next=new Chess(fen);
      const move=next.move({
        from:uci.slice(0,2) as never,
        to:uci.slice(2,4) as never,
        promotion:(uci[4]??'q') as never,
      });
      if(!move)throw new Error('Stockfish returned a move that the chess rules rejected.');
      setFens(current=>[...current,next.fen()]);
      setSans(current=>[...current,move.san]);
      setEngineStatus('Ready');
    }).catch(error=>{
      if(cancelled)return;
      setEngineStatus('Unavailable');
      setEngineError(error instanceof Error?error.message:'The engine search failed.');
    });

    return ()=>{
      cancelled=true;
      client.stop();
    };
  },[mode,engineReady,isEngineTurn,gameOver,fen,difficulty]);

  function move(from:string,to:string,promotion?:string){
    if(mode==='engine'&&game.turn()!==humanColor)return;
    const next=new Chess(fen);
    try{
      const m=next.move({from:from as never,to:to as never,promotion:(promotion??'q') as never});
      setFens(current=>[...current,next.fen()]);
      setSans(current=>[...current,m.san]);
      setImportMessage('');
      setEngineError('');
      setEngineInfo(null);
      onMove();
    }catch{/* ChessBoard only emits legal destinations. */}
  }

  function undo(){
    const steps=mode==='engine'?2:1;
    if(fens.length<=steps)return;
    setFens(current=>current.slice(0,-steps));
    setSans(current=>current.slice(0,-steps));
    setImportMessage('');
    setEngineInfo(null);
    setEngineError('');
  }

  function reset(){
    const initialFen=new Chess().fen();
    setStartFen(initialFen);
    setFens([initialFen]);
    setSans([]);
    setImportError('');
    setImportMessage('');
    setPgnText('');
    setEngineInfo(null);
    setEngineError('');
  }

  function changeHumanColor(color:'w'|'b'){
    setHumanColor(color);
    setOrientation(color);
    reset();
  }

  function exportPgn(){
    if(!sans.length)return;
    try{
      const replay=new Chess(startFen);
      for(const san of sans)replay.move(san);
      const blob=new Blob([replay.pgn()],{type:'application/x-chess-pgn;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;
      link.download='chessforge-practice.pgn';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch{
      setImportError('This game could not be exported. Reset the board and try again.');
    }
  }

  function importPgn(){
    setImportError('');
    setImportMessage('');
    try{
      const imported=new Chess();
      imported.loadPgn(pgnText,{strict:true});
      const fenLine=pgnText.replaceAll(String.fromCharCode(13),'').split(String.fromCharCode(10)).find(line=>line.startsWith('[FEN "'));
      const importedStartFen=fenLine?fenLine.substring(6,fenLine.length-2):new Chess().fen();
      const moves=imported.history();
      const replay=new Chess(importedStartFen);
      const replayFens=[replay.fen()];
      for(const san of moves){
        replay.move(san);
        replayFens.push(replay.fen());
      }
      setMode('local');
      setStartFen(importedStartFen);
      setFens(replayFens);
      setSans(moves);
      setOrientation('w');
      setImportMessage('Imported '+moves.length+' plies successfully.');
      setPgnText('');
      setImportOpen(false);
    }catch(error){
      setImportError(error instanceof Error?error.message:'The PGN could not be read. Check the notation and try again.');
    }
  }

  const canUndo=mode==='engine'?fens.length>=3:fens.length>1;
  const boardDisabled=gameOver||(mode==='engine'&&(!engineReady||isEngineTurn));
  const evaluation=formatEngineScore(engineInfo);

  return <>
    <PageTitle eyebrow="PRACTICE BOARD" title="Play with purpose." subtitle="Practice legal chess locally, challenge Stockfish, review your move sequence, and move games with PGN."/>
    <section className="panel engine-control">
      <div className="engine-control-heading">
        <div><small>CHOOSE YOUR OPPONENT</small><b>How do you want to practice?</b></div>
        <div className="engine-mode-tabs">
          <button className={mode==='local'?'selected':''} onClick={()=>setMode('local')}>Two players</button>
          <button className={mode==='engine'?'selected':''} onClick={()=>setMode('engine')}><Cpu/> Play Stockfish</button>
        </div>
      </div>
      {mode==='engine'&&<>
        <div className="engine-settings">
          <label><span>Play as</span><select value={humanColor} onChange={event=>changeHumanColor(event.target.value as 'w'|'b')}><option value="w">White</option><option value="b">Black</option></select></label>
          <label><span>Engine level</span><select value={difficulty} onChange={event=>setDifficulty(event.target.value as keyof typeof ENGINE_DIFFICULTIES)}><option value="casual">Casual · quick replies</option><option value="club">Club · balanced</option><option value="challenge">Challenge · longer thinking</option></select></label>
          <div className={'engine-status '+(engineReady?'ready':'loading')}><i/>{engineStatus}</div>
        </div>
        {engineError&&<p className="engine-error">{engineError} You can switch back to two-player practice.</p>}
        {engineInfo&&<div className="engine-evaluation"><div><small>ENGINE EVALUATION</small><b>{evaluation}</b></div><span>Depth {engineInfo.depth??'—'}</span><span>{engineInfo.nodes?engineInfo.nodes.toLocaleString()+' nodes':''}</span></div>}
        <p className="engine-footnote">Stockfish 18 Lite runs locally in a browser worker. The first load downloads approximately 7.3 MB. Engine code is separately licensed under GPL-3.0.</p>
      </>}
    </section>
    <div className="two-column">
      <section className="panel play-panel">
        <header><b>{status}</b><button className="text-link" onClick={()=>setOrientation(o=>o==='w'?'b':'w')}>Flip board <RotateCcw/></button></header>
        <div className="training-board"><ChessBoard fen={fen} onMove={move} orientation={orientation} disabled={boardDisabled}/></div>
        <div className="board-actions">
          <button className="btn secondary" onClick={undo} disabled={!canUndo||isEngineTurn}><Undo2/> Undo {mode==='engine'?'turn':'move'}</button>
          <button className="btn secondary" onClick={reset}><RotateCcw/> New game</button>
          <span>{sans.length} plies</span>
        </div>
        <div className="pgn-actions">
          <button className="btn secondary" onClick={exportPgn} disabled={!sans.length}>Export PGN</button>
          <button className="btn secondary" onClick={()=>{setImportOpen(v=>!v);setImportError('');}} disabled={mode==='engine'}>Import PGN</button>
        </div>
        {importMessage&&<p className="pgn-message">{importMessage}</p>}
        {importOpen&&<div className="pgn-import-panel">
          <label className="pgn-label">PASTE A PGN GAME
            <textarea className="pgn-textarea" value={pgnText} onChange={e=>setPgnText(e.target.value)} placeholder={'[Event "Casual game"]\n\n1. e4 e5 2. Nf3 Nc6'} rows={7}/>
          </label>
          <p className="pgn-help">Strict standard algebraic notation is checked before the board is replaced. PGNs with a FEN starting-position header are supported.</p>
          {importError&&<p className="pgn-error">{importError}</p>}
          <div className="pgn-actions">
            <button className="btn primary" onClick={importPgn} disabled={!pgnText.trim()}>Load game</button>
            <button className="btn secondary" onClick={()=>{setImportOpen(false);setImportError('');}}>Cancel</button>
          </div>
        </div>}
      </section>
      <aside className="panel move-panel">
        <small>GAME RECORD</small><h3>Move history</h3>
        {sans.length?Array.from({length:Math.ceil(sans.length/2)},(_,i)=><div className="move-row" key={i}><small>{i+1}.</small><b>{sans[i*2]}</b><b>{sans[i*2+1]??''}</b></div>):<div className="empty">♙<b>The board is ready.</b><span>Your moves appear here.</span></div>}
        <div className="tip"><Lightbulb/><b>Before every move</b><p>What is your opponent threatening? What are your forcing moves? What becomes weak after you move?</p></div>
      </aside>
    </div>
  </>;
}


function ProgressPage({progress,level,navigate}:{progress:ProgressState;level:ReturnType<typeof playerLevel>;navigate:(tab:Tab)=>void}){const percent=Math.max(0,Math.min(100,(progress.xp-level.current)/(level.next-level.current)*100));const skills=[['Foundations','Board vision and piece safety',progress.completedLessons.includes('board-vision')?1:0,1],['Tactical vision','Patterns and forcing moves',progress.solvedPuzzles.length,5],['Calculation','Candidate moves and variations',progress.completedLessons.includes('forcing-moves')?1:0,4],['Strategy','Plans and pawn structures',progress.completedLessons.filter(id=>['pawn-structures','prophylaxis'].includes(id)).length,5],['Endgames','Technical and practical endings',progress.completedLessons.includes('rook-endgames')?1:0,5]] as const;return <><PageTitle eyebrow="YOUR PLAYER PROFILE" title="Progress you can build on." subtitle="Track what you've completed and which areas of chess you've explored."/><div className="rank-card panel"><Crown/><div><small>YOUR CURRENT RANK</small><h2>Level {level.level} · {level.title}</h2><p>{progress.xp.toLocaleString()} XP earned</p></div><strong>{String(level.level).padStart(2,'0')}</strong><div className="rank-progress"><span>{level.next-progress.xp} XP to next level</span><i><b style={{width:`${percent}%`}}/></i></div></div><div className="stats"><Stat label="CURRENT STREAK" value={String(progress.streak)} detail="active days" icon={<Flame/>}/><Stat label="LESSONS MASTERED" value={String(progress.completedLessons.length)} detail={`of ${modules.length}`} icon={<GraduationCap/>}/><Stat label="POSITIONS SOLVED" value={String(progress.solvedPuzzles.length)} detail="unique puzzles" icon={<Target/>}/><Stat label="MOVES PRACTICED" value={String(progress.playedMoves)} detail="legal moves" icon={<Gamepad2/>}/></div><section className="section"><header><div><small>SKILL DEVELOPMENT</small><h2>Your chess profile</h2></div><span className="pill">EARLY ACCESS</span></header><div className="skill-list panel">{skills.map(s=><div className="skill-row" key={s[0]}><div><b>{s[0]}</b><span>{s[1]}</span></div><i><b style={{width:`${Math.min(100,s[2]/s[3]*100)}%`}}/></i><strong>{s[2]}/{s[3]}</strong></div>)}</div></section><div className="next-step"><div><small>KEEP BUILDING</small><h3>Your next best step</h3><p>Continue through the academy and return to the tactics lab.</p></div><button className="btn primary" onClick={()=>navigate('learn')}>Continue learning <ChevronRight/></button></div></>;}

function LessonModal({module,alreadyDone,close,complete}:{module:Module;alreadyDone:boolean;close:()=>void;complete:(grade:ReviewGrade)=>void}){
  const [checked,setChecked]=useState<number[]>([]);
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const [submitted,setSubmitted]=useState<Record<number,boolean>>({});
  const [grade,setGrade]=useState<ReviewGrade|null>(null);
  const content=lessonContent[module.id];
  const questions=content.knowledgeChecks;
  const allCorrect=questions.every((question,i)=>submitted[i]&&answers[i]===question.answerIndex);
  const ready=checked.length===module.lessons.length&&allCorrect&&grade!==null;
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
    <section className="lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-title">
      <button className="modal-close icon" onClick={close} aria-label="Close lesson"><X/></button>
      <div className="modal-art">♞<small>CHESSFORGE ACADEMY · {alreadyDone?'SCHEDULED REVIEW':'GUIDED LESSON'}</small></div>
      <div className="modal-body">
        <small>{module.category} · {module.level} · {module.minutes} MIN</small>
        <h2 id="lesson-title">{module.title}</h2>
        <p>{module.description}</p>
        <div className="check-heading">LEARNING SECTIONS <b>{checked.length}/{module.lessons.length} REVIEWED</b></div>
        <div className="lesson-sections">
          {module.lessons.map((item,i)=><article className="lesson-section" key={item}>
            <div className="lesson-section-heading"><small>CONCEPT 0{i+1}</small><h3>{item}</h3></div>
            <p>{content.explanations[i]}</p>
            <label className="lesson-read-check">
              <input type="checkbox" checked={checked.includes(i)} onChange={e=>setChecked(s=>e.target.checked?[...s,i]:s.filter(x=>x!==i))}/>
              <span>{checked.includes(i)?'Reviewed':'Mark this section reviewed'}</span>
            </label>
          </article>)}
        </div>
        <section className="lesson-quiz">
          <small>RETRIEVAL CHECK · {questions.length} QUESTIONS</small>
          <h3>Test what you remember before viewing the explanations again.</h3>
          {questions.map((question,i)=>{
            const isSubmitted=Boolean(submitted[i]);
            const isCorrect=answers[i]===question.answerIndex;
            return <article className="lesson-question" key={module.id + '-' + i}>
              <div className="lesson-question-heading"><small>QUESTION 0{i+1}</small><b>{question.question}</b></div>
              <div className="lesson-options">
                {question.options.map((option,j)=><button type="button" key={option}
                  className={'lesson-option '+(answers[i]===j?'selected ':'')+(isSubmitted&&isCorrect&&answers[i]===j?'correct ':'')+(isSubmitted&&!isCorrect&&answers[i]===j?'incorrect':'')}
                  aria-pressed={answers[i]===j}
                  disabled={isSubmitted&&isCorrect}
                  onClick={()=>{setAnswers(p=>({...p,[i]:j}));setSubmitted(p=>({...p,[i]:false}));setGrade(null);}}>
                  <span>{String.fromCharCode(65+j)}</span>{option}
                </button>)}
              </div>
              <div className="lesson-quiz-actions">
                <button className="btn secondary" disabled={answers[i]===undefined||isSubmitted&&isCorrect} onClick={()=>setSubmitted(p=>({...p,[i]:true}))}>Check answer</button>
                {isSubmitted&&<p className={isCorrect?'lesson-feedback correct':'lesson-feedback'}>{isCorrect?'Correct. ':'Not quite. '}{question.explanation}</p>}
              </div>
            </article>;
          })}
        </section>
        {checked.length===module.lessons.length&&allCorrect&&<section className="recall-rating">
          <small>SET YOUR NEXT REVIEW</small>
          <h3>How difficult was it to recall these ideas?</h3>
          <p>Choose honestly. Easier recall schedules a longer gap; difficult recall brings the lesson back sooner.</p>
          <div className="rating-options">
            {([
              ['again','Need another look'],
              ['hard','Difficult'],
              ['good','Comfortable'],
              ['easy','Easy'],
            ] as [ReviewGrade,string][]).map(([value,label])=><button type="button" key={value} className={grade===value?'rating-button selected':'rating-button'} aria-pressed={grade===value} onClick={()=>setGrade(value)}>{label}</button>)}
          </div>
        </section>}
        <div className="modal-footer">
          <em>{alreadyDone?'Review · no extra XP':'✦ '+module.xp+' XP on first completion'}</em>
          <button className="btn primary" disabled={!ready} onClick={()=>grade&&complete(grade)}>{alreadyDone?'Save review':ready?'Complete lesson':'Read sections, pass all checks, and rate recall'}</button>
        </div>
        <p className="disclaimer">Completion requires reviewing every section, answering all three checks correctly, and rating recall. Reviews never award duplicate lesson XP.</p>
      </div>
    </section>
  </div>;
}
