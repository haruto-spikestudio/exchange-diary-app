(() => {
'use strict';
const app = document.querySelector('#app');
const icons = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const iconButton = (name,label,action) => `<button class="icon-button" aria-label="${label}" data-action="${action}">${icons(name)}</button>`;
const state = { screen:'library', notebook:'いつもの3人', template:'prompt', paper:'plain', tool:'sticker', pen:'round', ink:'#2b2a33', stampCategory:'word', search:'', view:'grid', filter:'all', invite:false, reactions:new Set(), fields:[], strokes:[], sent:false, readSource:'history', panelOpen:true };

// ペン：細字、まる、ふと、筆ペン、マーカー、蛍光、ステッチ、ドット、キラキラ
const pens=[
  {id:'fine',name:'ほそ',width:1.6,alpha:1,dash:[]},
  {id:'round',name:'まる',width:3,alpha:1,dash:[]},
  {id:'bold',name:'ふと',width:7,alpha:1,dash:[]},
  {id:'brush',name:'ふで',width:9,alpha:.95,dash:[]},
  {id:'marker',name:'マーカー',width:15,alpha:.38,dash:[]},
  {id:'hi',name:'蛍光',width:22,alpha:.28,dash:[]},
  {id:'dash',name:'ステッチ',width:3,alpha:1,dash:[7,6]},
  {id:'dots',name:'ドット',width:5,alpha:1,dash:[.1,8]},
  {id:'glitter',name:'キラ',width:4,alpha:.85,dash:[]}
];

// インク色：画像で頻出するベージュ・茶・黒・グレー・ゴールド等を追加
const inks=[
  ['くろ','#2b2a33'],
  ['チャコール','#4b4a56'],
  ['グレー','#8a8993'],
  ['あか','#d9524a'],
  ['ピンク','#e35e94'],
  ['さくら','#f2a9bf'],
  ['オレンジ','#e68a3b'],
  ['きいろ','#eec03a'],
  ['みどり','#54a97c'],
  ['あお','#2f82a8'],
  ['ネイビー','#304d78'],
  ['むらさき','#8d71bf'],
  ['ちゃ','#88613e'],
  ['ベージュ','#c7a985']
];

// ステッカー：文字 / モチーフ / キャラ / ふきだし / ワシテープ / 枠
const stamps={
  word:[['NICE!','pop'],['GOOD DAY','ribbon'],['さいこう','pop'],['おつかれ！','bubble'],['THANK YOU','ribbon-green'],['またあそぼ','bubble'],['Today','pop'],['Diary','ribbon-pink'],['TOP3','pop'],['memo','pop']],
  shape:[['♥','heart'],['✦','sparkle'],['☺','smile'],['✿','flower'],['★','star'],['♡','outline'],['ドット','dots'],['チェック','check'],['きらきら','twinkle']],
  chara:[['🐰','chara'],['🐻','chara'],['🐶','chara'],['🐱','chara'],['🧸','chara'],['🌷','chara'],['🍰','chara'],['☕︎','chara'],['🎀','chara']],
  bubble:[['かわいい〜','balloon'],['たのしかった','balloon'],['え〜ほんと？','balloon-pink'],['また！','balloon-pink'],['music♪','balloon']],
  tape:[['ドット柄','tape-dot'],['ストライプ','tape-stripe'],['方眼','tape-grid'],['クラフト','tape-kraft'],['さくら','tape-cherry'],['ブラック','tape-black']],
  frame:[['Polaroid','polaroid'],['メモ','memo-card'],['Ticket','ticket']]
};
const stampCats=[['word','文字'],['shape','モチーフ'],['chara','キャラ'],['bubble','ふきだし'],['tape','ワシテープ'],['frame','フレーム']];

// テンプレート定義。paper は紙の種類。fields はページに置くベース要素。
const templates={
  prompt:{
    name:'今日のページ', desc:'質問の入力欄が<br>用意されたページ。', paper:'plain',
    build:()=>[
      {label:'今日あったこと',text:'友だちとカフェに行きました。',x:3,y:6,w:88},
      {label:'みんなへの質問',text:'最近のおすすめは？',x:3,y:32,w:88},
      {kind:'stamp',label:'GOOD DAY',text:'GOOD DAY',variant:'ribbon',x:4,y:73,w:29},
      {kind:'stamp',label:'キラキラ',text:'✦',variant:'sparkle',x:70,y:73,w:18}
    ]
  },
  blank:{
    name:'方眼ノート', desc:'余白の多いページに、<br>好きなことを書こう。', paper:'grid',
    build:()=>[
      {label:'きょうのきろく',text:'友だちと、たくさん話した日。',x:3,y:5,w:80},
      {kind:'stamp',label:'NICE!',text:'NICE!',variant:'pop',x:58,y:57,w:30}
    ]
  },
  schedule:{
    name:'今週のスケジュール', desc:'月〜日の予定と、<br>今週の気分をメモ。', paper:'grid',
    build:()=>[
      {label:'今週のメモ',text:'月の始まり。',x:3,y:5,w:62},
      {label:'MON',text:'',x:3,y:22,w:30},
      {label:'TUE',text:'',x:36,y:22,w:30},
      {label:'WED',text:'',x:69,y:22,w:28},
      {label:'THU',text:'',x:3,y:43,w:30},
      {label:'FRI',text:'',x:36,y:43,w:30},
      {label:'SAT / SUN',text:'',x:69,y:43,w:28},
      {kind:'stamp',label:'Today',text:'Today',variant:'ribbon',x:68,y:4,w:28},
      {kind:'stamp',label:'さくらテープ',text:'',variant:'tape-cherry',x:5,y:68,w:50}
    ]
  },
  top3:{
    name:'ハマってる TOP3', desc:'今ハマってるものを<br>3つ書き出すページ。', paper:'lined',
    build:()=>[
      {label:'タイトル',text:'今ハマってる TOP3',x:3,y:4,w:76},
      {label:'1位',text:'',x:3,y:21,w:90},
      {label:'2位',text:'',x:3,y:42,w:90},
      {label:'3位',text:'',x:3,y:63,w:90},
      {kind:'stamp',label:'TOP3',text:'TOP3',variant:'pop',x:70,y:3,w:26},
      {kind:'stamp',label:'star',text:'★',variant:'star',x:75,y:80,w:17}
    ]
  },
  wishlist:{
    name:'欲しいもの TOP3', desc:'いま欲しいものを<br>3つ並べる。', paper:'dot',
    build:()=>[
      {label:'タイトル',text:'欲しいもの TOP3',x:3,y:4,w:76},
      {label:'① ほしいもの',text:'',x:3,y:21,w:90},
      {label:'② ほしいもの',text:'',x:3,y:42,w:90},
      {label:'③ ほしいもの',text:'',x:3,y:63,w:90},
      {kind:'stamp',label:'wishlist',text:'Wish♡',variant:'ribbon',x:68,y:3,w:28},
      {kind:'stamp',label:'heart',text:'♥',variant:'heart',x:74,y:82,w:18}
    ]
  },
  news:{
    name:'News & Happy', desc:'今日のニュース、<br>Happy・Badを交換。', paper:'plain',
    build:()=>[
      {label:'今日の担当',text:'',x:3,y:3,w:38},
      {label:'日付',text:'',x:45,y:3,w:52},
      {label:'News',text:'',x:3,y:16,w:94},
      {label:'Happy News',text:'',x:3,y:52,w:45},
      {label:'Bad News',text:'',x:3,y:72,w:45},
      {label:'みんなに質問',text:'Q.\nA.',x:50,y:52,w:47},
      {kind:'stamp',label:'🐰',text:'🐰',variant:'chara',x:84,y:38,w:12}
    ]
  },
  profile:{
    name:'プロフィール', desc:'自己紹介テンプレ。<br>一問一答に答える。', paper:'dot',
    build:()=>[
      {label:'Profile',text:'',x:3,y:3,w:62},
      {label:'なまえ',text:'',x:3,y:16,w:55},
      {label:'すんでいるところ',text:'',x:3,y:28,w:55},
      {label:'SNS',text:'@',x:3,y:40,w:55},
      {label:'ひとこと',text:'',x:3,y:52,w:94},
      {label:'血液型・星座',text:'',x:3,y:68,w:45},
      {label:'好きなもの',text:'',x:50,y:68,w:47},
      {label:'将来の夢',text:'',x:3,y:82,w:94},
      {kind:'stamp',label:'🎀',text:'🎀',variant:'chara',x:68,y:2,w:14}
    ]
  },
  trip:{
    name:'旅の記録', desc:'Day1〜Day4で<br>旅の思い出を残す。', paper:'kraft',
    build:()=>[
      {label:'タイトル',text:'OKINAWA TRIP',x:3,y:3,w:70},
      {label:'DAY1',text:'',x:3,y:19,w:94},
      {label:'DAY2',text:'',x:3,y:39,w:94},
      {label:'DAY3',text:'',x:3,y:59,w:94},
      {label:'DAY4',text:'',x:3,y:79,w:94},
      {kind:'stamp',label:'Ticket',text:'Ticket',variant:'ticket',x:72,y:3,w:25}
    ]
  },
  playlist:{
    name:'プレイリスト', desc:'今月のTOPトラックと<br>お気に入りを残す。', paper:'lined',
    build:()=>[
      {label:'MONTH',text:'DEC',x:3,y:3,w:30},
      {label:'TOP TRACKS',text:'1.\n2.\n3.\n4.',x:3,y:18,w:52},
      {label:'my favourite',text:'',x:58,y:18,w:39},
      {label:'MEMO',text:'',x:3,y:62,w:94},
      {kind:'stamp',label:'playlist',text:'play\nlist',variant:'pop',x:68,y:3,w:26},
      {kind:'stamp',label:'music',text:'music♪',variant:'balloon',x:76,y:82,w:20}
    ]
  }
};

const data = [
 {name:'いつもの3人', color:'pink', cover:'OUR DIARY', subtitle:'あなたの番', members:'3人'},
 {name:'週末のふたり', color:'blue', cover:'WEEKEND NOTES', subtitle:'新しいページ', members:'2人', current:'みお'},
 {name:'放課後ノート', color:'lav', cover:'AFTER SCHOOL', subtitle:'次は みお の番', members:'3人', current:'みお'}
];

function header(title,back='library',right='') { return `<div class="status"><span>9:41</span><span class="status-right">● ▰</span></div><header class="topbar glass">${iconButton('back','戻る',`go:${back}`)}<strong>${title}</strong>${right}</header>`; }
function nav(active='library') { return `<nav class="bottom-nav glass" aria-label="メインナビゲーション"><button class="nav-item ${active==='library'?'active':''}" data-action="go:library">${icons('book')}<span>日記帳</span></button><button class="nav-item nav-write" data-action="go:templates"><span class="nav-write-icon">${icons('plus')}</span><span>書く</span></button><button class="nav-item" data-action="go:invite">${icons('users')}<span>招待</span></button></nav>`; }
function toast(message) { document.querySelector('.feedback')?.remove(); const n=document.createElement('div');n.className='feedback';n.setAttribute('role','status');n.textContent=message;app.append(n);setTimeout(()=>n.remove(),2400); }

function library() {
  const books=data.filter(b=>b.name.includes(state.search)).filter(b=>state.filter==='all'||(state.filter==='turn'&&b.name==='いつもの3人'&&!state.sent)||(state.filter==='new'&&b.subtitle==='新しいページ'));
  const card=b=>{const status=b.name==='いつもの3人'&&state.sent?'次は みお の番':b.subtitle;return `<button class="book-item" data-action="open:${b.name}"><div class="cover ${b.color}"><div class="cover-mark"><span>EXCHANGE DIARY</span><b>${b.cover}</b></div></div><div class="book-details"><div class="book-name">${b.name}</div><div class="book-meta">${status==='あなたの番'?'<span class="dot"></span>':''}${status} · ${b.members}<br>最終更新：サンプル日付</div></div></button>`;};
  return `<div class="status"><span>9:41</span><span class="status-right">● ▰</span></div><header class="topbar glass library-top"><strong>交換日記</strong>${iconButton('search','検索','focus-search')}${iconButton('plus','日記帳を作る','unavailable:日記帳の新規作成は表示例です')}</header><main class="scroll"><div class="content library-content"><div class="heading-row"><div><h1>日記帳</h1><p>友だちとつづる、いつもの日々。</p></div></div><label class="search-box">${icons('search')}<input id="search" type="search" placeholder="日記帳を探す" value="${escapeHtml(state.search)}" aria-label="日記帳を検索"></label><div class="filter-chips" aria-label="日記帳を絞り込み">${[['all','すべて'],['turn','あなたの番'],['new','新着']].map(([k,v])=>`<button class="filter-chip ${state.filter===k?'selected':''}" aria-pressed="${state.filter===k}" data-action="filter:${k}">${v}</button>`).join('')}</div><div class="library-filter"><span class="filter-label">${books.length} 冊 <span class="subtle"> · あなたの番・新着 順</span></span><div class="library-tools">${[['grid','表紙表示'],['list','リスト表示']].map(([view,label])=>`<button class="view-option ${state.view===view?'active':''}" aria-label="${label}" aria-pressed="${state.view===view}" data-action="view:${view}">${icons(view)}</button>`).join('')}</div></div><div class="grid library-grid ${state.view==='list'?'list-view':''}">${books.map(card).join('') || '<p class="empty">該当する日記帳はありません</p>'}</div></div></main>${nav()}`;
}
function notebook() {
  const b=data.find(x=>x.name===state.notebook)||data[0];const own=b.name==='いつもの3人'&&!state.sent;const current=own?'あなた':(b.current||'みお');
  const members=b.members==='2人'?[current,'あなた']:(own?['あなた','みお','はな']:['みお','はな','あなた']);
  const mark=x=>`<span class="avatar ${x==='みお'?'blue':x==='はな'?'pink':''}">${x.slice(0,1)}</span><span>${x}</span>`;
  return `${header(escapeHtml(b.name),'library',iconButton('users','友だちを招待','go:invite'))}<main class="scroll"><div class="content"><div class="notebook-hero glass-thick"><div class="mini-cover ${b.color}"></div><div><p class="eyebrow">EXCHANGE DIARY</p><h1>${escapeHtml(b.name)}</h1><p>${b.members}の交換日記</p><button class="text-action" data-action="go:order">順番を見る ›</button></div></div><div class="notice ${own?'turn':''}"><span class="tag">${own?'あなたの番です':`${current} の番です`}</span><p>${own?'今日あったことを、次の人へ。<br>気が向いたときに、ゆっくり書こう。':b.subtitle==='新しいページ'?'新しいページが届いています。':'次のページを楽しみに待ちましょう。'}</p></div><div style="margin-top:15px"><button class="primary full ${own?'':'quiet'}" data-action="${own?'go:templates':state.sent&&b.name==='いつもの3人'?'go:read':'history:sample'}">${icons(own?'pen':'book')} ${own?'日記を書く':'ページを見る'}</button></div><div class="section-head"><h2>今の順番</h2><button class="text-action" data-action="go:order">くわしく見る ›</button></div><div class="order-row">${members.map(mark).join('<span class="arrow">→</span>')}</div><div class="section-head"><h2>これまでのページ</h2><span class="subtle" style="font-size:11px">新しい順</span></div><button class="history" data-action="history:sample"><span class="page-thumb"></span><span><strong>友だちのページ</strong><small>この前行ったカフェのこと</small><small>サンプル日付</small></span>${icons('chevron')}</button><button class="history" data-action="history:sample"><span class="page-thumb"></span><span><strong>前のページ</strong><small>最近の小さなうれしいこと</small><small>サンプル日付</small></span>${icons('chevron')}</button></div></main>${nav()}`;
}
function order() {const book=data.find(x=>x.name===state.notebook)||data[0];const own=book.name==='いつもの3人'&&!state.sent;const names=own?['あなた','みお','はな']:book.members==='2人'?['みお','あなた']:['みお','はな','あなた'];return `${header('順番','notebook')}<main class="scroll"><div class="content"><p class="eyebrow">CURRENT ROUND</p><h1 class="page-title">今の順番</h1><p class="subtle" style="font-size:12px;line-height:1.8">現在の担当者は変わりません。<br>この周は、まだ書いていない人同士を並び替えられます。</p><div class="invite-card glass-thick">${names.map((x,i)=>`<p>${i+1}　${x} ${i===0?'<span style="color:#5d74a3;font-size:12px">今の担当</span>':''}</p>`).join('')}</div><div class="notice" style="margin-top:18px"><span class="tag">次の周について</span><p>書き終わった人を含む変更や、途中参加した人の順番は次の周から反映されます。</p></div><button class="secondary" style="margin-top:20px;width:100%" data-action="unavailable:順番変更は表示例です">順番を変更</button></div></main>`;}

// テンプレート選択。画像で見られるようなジャーナル系のテンプレート9種から選ぶ
function templatesScreen() {
  const paperIcon=p=>p==='grid'?'<div class="type-paper grid-paper"></div>':p==='dot'?'<div class="type-paper dot-paper"></div>':p==='lined'?'<div class="type-paper lined-paper"></div>':p==='kraft'?'<div class="type-paper kraft-paper"></div>':'<div class="type-paper"></div>';
  const miniPreview=(id,tpl)=>{
    const paper=`type-paper ${tpl.paper==='grid'?'grid-paper':tpl.paper==='dot'?'dot-paper':tpl.paper==='lined'?'lined-paper':tpl.paper==='kraft'?'kraft-paper':''}`;
    const mini={
      prompt:'<b>今日あったこと</b><div class="line"></div><div class="line"></div><b style="margin-top:9px;display:block">みんなへの質問</b><div class="line"></div>',
      blank:'<b>きょうのきろく</b><div style="width:52px;height:38px;background:#dce8ee;margin:12px 0"></div><div class="line"></div>',
      schedule:'<b>MON</b><div class="line"></div><b>TUE</b><div class="line"></div><b>WED</b><div class="line"></div>',
      top3:'<b>TOP3</b><div class="line"></div><b>①</b><div class="line"></div><b>②</b><div class="line"></div>',
      wishlist:'<b>Wishlist</b><div class="line"></div><b>♡</b><div class="line"></div>',
      news:'<b>News</b><div class="line"></div><div class="line"></div><b>Happy</b><div class="line"></div>',
      profile:'<b>Profile</b><div class="line"></div><b>Q.</b><div class="line"></div>',
      trip:'<b>Day1</b><div class="line"></div><b>Day2</b><div class="line"></div>',
      playlist:'<b>Top Tracks</b><div class="line"></div><div class="line"></div>'
    };
    return `<div class="type-preview"><div class="${paper}">${mini[id]||''}</div></div>`;
  };
  const items=Object.entries(templates).map(([id,tpl])=>`<button class="type-option" data-action="template:${id}">${miniPreview(id,tpl)}<h2>${tpl.name}</h2><p>${tpl.desc}</p></button>`).join('');
  return `${header('ページをつくる','notebook')}<main class="scroll"><div class="content"><p class="eyebrow">NEW PAGE</p><h1 class="page-title">テンプレートをえらぼう</h1><p class="subtle" style="font-size:12px;line-height:1.7">どれも文字を直接入力し、スタンプや写真を自由に配置できます。</p><div class="type-grid">${items}</div><div class="notice" style="margin-top:28px"><span class="tag">テンプレートは仮案です</span><p>入力欄は移動でき、空欄のままでも大丈夫。</p></div></div></main>`;
}

const toolList=[['select','選択'],['pen','ペン'],['eraser','消しゴム'],['text','文字'],['image','写真'],['sticker','スタンプ']];
function toolbar() {return `<div class="toolbar glass" role="toolbar" aria-label="編集ツール">${toolList.map(([n,t])=>`<button class="tool ${state.tool===n?'active':''}" data-action="tool:${n}" aria-label="${t}" aria-pressed="${state.tool===n}">${icons(n)}<span>${t}</span></button>`).join('')}</div>`;}
function toolPanel(){
 const panelToggle=`<button class="panel-toggle" data-action="toggle-panel" aria-expanded="${state.panelOpen}" aria-controls="deco-options">${state.panelOpen?'− パネルをたたむ':'＋ パネルをひらく'}</button>`;
 if((state.tool==='pen'||state.tool==='sticker')&&!state.panelOpen)return `<div class="deco-panel glass collapsed">${panelToggle}<div id="deco-options" hidden></div></div>`;
 if(state.tool==='pen')return `<div class="deco-panel glass">${panelToggle}<div id="deco-options"><div class="deco-panel-title">ペンをえらぶ <span>色もえらべるよ</span></div><div class="pen-options">${pens.map(p=>`<button class="pen-choice ${state.pen===p.id?'active':''}" data-action="pen:${p.id}" aria-pressed="${state.pen===p.id}"><span class="pen-sample ${p.id}" style="--ink:${state.ink}"></span>${p.name}</button>`).join('')}</div><div class="ink-row">${inks.map(([name,color])=>`<button class="ink-choice ${state.ink===color?'active':''}" style="--ink:${color}" data-action="ink:${color}" aria-label="${name}" aria-pressed="${state.ink===color}"></button>`).join('')}<button class="undo-link" data-action="undo-stroke">ひとつ戻す</button></div></div></div>`;
 if(state.tool==='sticker')return `<div class="deco-panel glass">${panelToggle}<div id="deco-options"><div class="deco-panel-title">スタンプをえらぶ <span>タップでページに追加</span></div><div class="stamp-tabs">${stampCats.map(([k,v])=>`<button class="${state.stampCategory===k?'active':''}" data-action="stamp-category:${k}">${v}</button>`).join('')}</div><div class="stamp-options">${stamps[state.stampCategory].map(([label,style],i)=>`<button class="stamp-option ${style}" data-action="add-stamp:${i}" aria-label="${escapeHtml(label)}を追加">${escapeHtml(label)}</button>`).join('')}</div></div></div>`;
 if(state.tool==='eraser')return '<div class="editor-subbar glass"><span>ページをタップすると最後の線を１本消します</span><button data-action="undo-stroke">ひとつ戻す</button></div>';
 if(state.tool==='select')return '<div class="editor-subbar glass"><span>つまみをドラッグして移動</span><button data-action="add-text">＋ 文字を追加</button></div>';
 return '<div class="editor-subbar glass"><span>入力欄をタップして文字を入力</span><button data-action="add-text">＋ 文字を追加</button></div>';
}
function decorationStyle(){const n=Object.keys(templates).indexOf(state.template);return `--tape-x:${[18,60,31,53,23,66,38,12,57][n]||42}%;--tape-rotation:${[-7,4,-3,6,2,-5,7,-2,3][n]||0}deg;--sparkle-right:${[22,45,18,32,52,24,44,15,38][n]||22}px`; }
function paperClass(){return state.paper==='grid'?'grid-paper':state.paper==='dot'?'dot-paper':state.paper==='lined'?'lined-paper':state.paper==='kraft'?'kraft-paper':'';}
function editor() {
  const fields=state.fields.map((f,i)=>{const handle=`<button type="button" class="move-handle" aria-label="${escapeHtml(f.label||f.text)}を移動" title="ドラッグして移動">⠿</button>`;const del=state.tool==='select'?`<button class="delete-piece" data-action="delete-piece:${i}" aria-label="${escapeHtml(f.label||f.text)}を削除">×</button>`:'';if(f.kind==='stamp')return `<div class="placed-field stamp-field ${f.variant} ${state.tool==='select'?'moving':''}" data-index="${i}" style="left:${f.x}%;top:${f.y}%;width:${f.w}%">${handle}${del}<span>${escapeHtml(f.text)}</span></div>`;return `<div class="placed-field text-field ${state.tool==='select'?'moving':''}" data-index="${i}" style="left:${f.x}%;top:${f.y}%;width:${f.w}%">${handle}${del}<label for="placed-${i}">${escapeHtml(f.label)}</label><textarea id="placed-${i}" data-field="${i}" rows="2" placeholder="ここに入力" ${state.tool==='select'?'readonly':''}>${escapeHtml(f.text)}</textarea></div>`;}).join('');
  return `${header('デコレーション','templates','<span class="top-label">サンプル</span>')}${toolbar()}${toolPanel()}<main class="scroll editor-scroll"><article class="page-sheet ${paperClass()}" style="${decorationStyle()}"><div class="sheet-date">OUR LITTLE MEMORY　 ✦　 SAMPLE</div><h1 class="sheet-title">${templates[state.template]?.name||'ページ'}</h1><div class="canvas-wrap ${state.tool==='pen'||state.tool==='eraser'?'pen-active':''}">${fields}<canvas class="draw" aria-label="手書き領域"></canvas></div></article><p class="tip">スタンプや文字は「選択」で動かせます。写真は表示例です。</p></main><div class="editor-action"><button class="primary" data-action="go:preview" aria-label="プレビューへ進む"><span class="editor-action-short">次へ ›</span><span class="editor-action-full">できた！ プレビューへ　✦</span></button></div>`;
}
function pageContent(){const fields=state.fields.map(f=>f.kind==='stamp'?`<div class="placed-preview stamp-field ${f.variant}" style="left:${f.x}%;top:${f.y}%;width:${f.w}%"><span>${escapeHtml(f.text)}</span></div>`:`<div class="placed-preview text-field" style="left:${f.x}%;top:${f.y}%;width:${f.w}%"><div class="placed-label">${escapeHtml(f.label)}</div><p>${escapeHtml(f.text||'')}</p></div>`).join('');const paths=state.strokes.map(path=>`<polyline points="${path.points.map(([x,y])=>`${x},${y}`).join(' ')}" fill="none" stroke="${path.color}" stroke-width="${path.width}" opacity="${path.alpha}" ${path.dash.length?`stroke-dasharray="${path.dash.join(' ')}"`:''} stroke-linecap="round" stroke-linejoin="round"/>`).join('');return `<div class="drawing-preview">${fields}<svg viewBox="0 0 ${state.canvasWidth||300} ${state.canvasHeight||380}" preserveAspectRatio="none" aria-label="手書きのプレビュー">${paths}</svg></div>`;}
function preview() {return `${header('プレビュー','editor')}<main class="scroll editor-scroll"><article class="page-sheet read-sheet ${paperClass()}" style="${decorationStyle()}"><div class="sheet-date">SAMPLE PAGE</div><h2 class="sheet-title">${templates[state.template]?.name||'ページ'}</h2>${pageContent()}</article><div class="warning">渡した後は、このページを編集できません。<br>次は <b>みお</b> の番です。</div></main><div class="bottom-action glass"><button class="primary full" data-action="send">みおに渡す</button></div>`;}
function sent(){return `${header('渡しました','notebook')}<main class="scroll"><div class="content success"><div class="success-mark">${icons('check')}</div><h1>ページを渡しました</h1><p>次は みお の番です。<br>次のページが届くまで、のんびり待ちましょう。</p><button class="primary quiet full" style="margin-top:40px" data-action="go:read">ページを見る</button><button class="text-action" style="margin-top:15px" data-action="go:notebook">日記帳に戻る</button></div></main>`;}
function reading(){return `${header(state.notebook,'notebook',iconButton('more','メニュー','unavailable:メニューは表示例です'))}<main class="scroll"><div class="editor-scroll" style="padding-bottom:25px"><article class="page-sheet read-sheet ${paperClass()}" style="${decorationStyle()}"><div class="sheet-date">${state.readSource==='history'?'友だちのページ':'あなたのページ'}　 /　 SAMPLE</div><h1 class="sheet-title">${state.readSource==='history'?'ある日のきろく':templates[state.template]?.name||'ページ'}</h1>${state.readSource==='history'?'<h3>今日あったこと</h3><p>気になっていたカフェに行ってきました。</p><h3>みんなへの質問</h3><p>最近のお気に入りを教えてね。</p>':pageContent()}</article></div><div class="content" style="padding-top:3px"><div class="section-head"><h2>リアクション</h2></div><div class="reaction-row">${['♡','☺','✦'].map(x=>`<button class="reaction ${state.reactions.has(x)?'selected':''}" data-action="reaction:${x}" aria-pressed="${state.reactions.has(x)}">${x}${state.reactions.has(x)?' 1':''}</button>`).join('')}<button class="reaction unavailable" disabled aria-label="絵文字追加は準備中">＋ 絵文字（準備中）</button></div><div class="section-head"><h2>コメント</h2></div><button class="secondary" style="width:100%;text-align:left;font-weight:400;color:#7d8490" data-action="unavailable:コメントは表示例です">ひとことを書く</button></div></main>`; }
function invite(){return `${header('友だちを招待','notebook')}<main class="scroll"><div class="content"><p class="eyebrow">INVITATION</p><h1 class="page-title">いっしょに書こう</h1><p class="subtle" style="font-size:12px;line-height:1.8">「${escapeHtml(state.notebook)}」に友だちを招待します。</p><div class="invite-card glass-thick"><h2>招待リンクについて</h2><ul><li>有効期限は24時間</li><li>参加できるのは１人まで</li><li>承認なしで参加できます</li></ul></div><div class="warning"><b>リンクの取り扱いにご注意</b><br>転送先の人も参加でき、過去のページを読むことができます。</div>${state.invite?'<div class="link-box">https://example.test/invite/sample</div><p class="subtle" style="font-size:11px">このリンクは表示例です。実際の招待はできません。</p>':''}<button class="primary full" style="margin-top:22px" data-action="${state.invite?'go:join':'create-invite'}">${state.invite?'招待された人の画面を見る':'招待リンクをつくる'}</button>${state.invite?'<button class="text-action" data-action="invalidate">リンクを無効化</button>':''}</div></main>`; }
function join(){return `${header('招待が届きました','invite')}<main class="scroll"><div class="content"><p class="eyebrow">INVITATION</p><h1 class="page-title">日記帳に参加</h1><div class="notebook-hero glass-thick" style="margin-top:28px"><div class="mini-cover"></div><div><h1>${escapeHtml(state.notebook)}</h1><p>メンバー 3人</p></div></div><div class="notice"><span class="tag">参加する前に</span><p>これまでのページも読めます。あなたの順番は次の周の最後からです。</p></div><button class="primary full" style="margin-top:28px" data-action="go:joined">参加する</button><p class="tip">サンプルのため、実際の参加は行われません。</p></div></main>`;}
function joined(){return `${header('参加しました','library')}<main class="scroll"><div class="content"><p class="eyebrow">WELCOME</p><h1 class="page-title">日記帳へようこそ</h1><p class="subtle" style="font-size:12px;line-height:1.8">あなたの番は次の周の最後からです。</p><div class="invite-card glass-thick"><h2>いまの周</h2><p>①　はな　<span class="subtle">担当中</span></p><p>②　みお</p><p>③　ゆい</p><hr style="border:0;border-top:1px solid #eee"><p style="font-size:12px;color:#6278a4">次の周の最後　→　あなた</p></div><button class="primary full" style="margin-top:25px" data-action="go:read">過去のページを読む</button></div></main>`;}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){const views={library,notebook,order,templates:templatesScreen,editor,preview,sent,read:reading,invite,join,joined};app.innerHTML=(views[state.screen]||library)(); if(state.screen==='editor'){setupCanvas();const scroll=app.querySelector('.editor-scroll');const action=app.querySelector('.editor-action');const update=()=>action.classList.toggle('at-end',scroll.scrollTop+scroll.clientHeight>=scroll.scrollHeight-8);scroll.addEventListener('scroll',update,{passive:true});update();const toggle=app.querySelector('.panel-toggle');let startY=null;toggle?.addEventListener('pointerdown',e=>{startY=e.clientY});toggle?.addEventListener('pointerup',e=>{if(startY!==null&&startY-e.clientY>35&&state.panelOpen){toggle.click()}startY=null});toggle?.addEventListener('pointercancel',()=>{startY=null});}}
function setupCanvas(){const canvas=app.querySelector('canvas');if(!canvas)return;const r=canvas.getBoundingClientRect(),d=window.devicePixelRatio||1;state.canvasWidth=r.width;state.canvasHeight=r.height;canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);const ctx=canvas.getContext('2d');ctx.scale(d,d);ctx.lineCap='round';ctx.lineJoin='round';function draw(){ctx.clearRect(0,0,r.width,r.height);for(const path of state.strokes){ctx.strokeStyle=path.color;ctx.lineWidth=path.width;ctx.globalAlpha=path.alpha;ctx.setLineDash(path.dash);ctx.beginPath();path.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));if(path.points.length===1)ctx.lineTo(path.points[0][0]+.1,path.points[0][1]+.1);ctx.stroke();}}draw();app.querySelectorAll('.move-handle').forEach(handle=>{const item=handle.closest('.placed-field');const index=Number(item.dataset.index);let origin=null;handle.addEventListener('pointerdown',e=>{if(state.tool!=='select')return;e.preventDefault();handle.setPointerCapture(e.pointerId);origin={x:e.clientX,y:e.clientY,left:state.fields[index].x,top:state.fields[index].y};});handle.addEventListener('pointermove',e=>{if(!origin)return;const f=state.fields[index];f.x=Math.max(0,Math.min(100-f.w,origin.left+(e.clientX-origin.x)/r.width*100));f.y=Math.max(0,Math.min(f.kind==='stamp'?86:76,origin.top+(e.clientY-origin.y)/r.height*100));item.style.left=f.x+'%';item.style.top=f.y+'%';});handle.addEventListener('pointerup',()=>origin=null);handle.addEventListener('pointercancel',()=>origin=null);handle.addEventListener('keydown',e=>{if(state.tool!=='select')return;const delta={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]}[e.key];if(!delta)return;e.preventDefault();const f=state.fields[index];f.x=Math.max(0,Math.min(100-f.w,f.x+delta[0]));f.y=Math.max(0,Math.min(f.kind==='stamp'?86:76,f.y+delta[1]));item.style.left=f.x+'%';item.style.top=f.y+'%';});});let current=null;canvas.addEventListener('pointerdown',e=>{if(state.tool==='eraser'){state.strokes.pop();draw();return}if(state.tool!=='pen')return;canvas.setPointerCapture(e.pointerId);const pen=pens.find(p=>p.id===state.pen);current={color:state.ink,width:pen.width,alpha:pen.alpha,dash:pen.dash,points:[[e.offsetX,e.offsetY]]};state.strokes.push(current);draw();});canvas.addEventListener('pointermove',e=>{if(!current)return;current.points.push([e.offsetX,e.offsetY]);draw();});canvas.addEventListener('pointerup',()=>current=null);canvas.addEventListener('pointercancel',()=>current=null);}
app.addEventListener('input',e=>{if(e.target.id==='search'){state.search=e.target.value;const pos=e.target.selectionStart;render();const n=app.querySelector('#search');n.focus();n.setSelectionRange(pos,pos)}else if(e.target.matches('[data-field]'))state.fields[Number(e.target.dataset.field)].text=e.target.value;});
app.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el)return;const [kind,...rest]=el.dataset.action.split(':');const value=rest.join(':');if(kind==='go'){if(value==='read')state.readSource=state.sent&&state.notebook==='いつもの3人'?'current':'history';if(value==='templates'&&(state.sent||state.notebook!=='いつもの3人')){state.screen='notebook';render();toast('まだ自分の番ではありません');return}state.screen=value;render()}else if(kind==='history'){state.readSource='history';state.screen='read';render()}else if(kind==='open'){state.notebook=value;state.screen='notebook';render()}else if(kind==='template'){const tpl=templates[value];if(!tpl){toast('そのテンプレートは準備中です');return}state.template=value;state.paper=tpl.paper;state.tool='sticker';state.strokes=[];state.fields=tpl.build();state.screen='editor';render()}else if(kind==='tool'){if(value==='image'){toast('このツールは表示例です');return}state.tool=value;render()}else if(kind==='pen'){state.pen=value;render()}else if(kind==='ink'){state.ink=value;render()}else if(kind==='stamp-category'){state.stampCategory=value;render()}else if(kind==='add-stamp'){const [text,variant]=stamps[state.stampCategory][Number(value)];const tapeOrFrame=variant.startsWith('tape-')||['polaroid','memo-card','ticket'].includes(variant);const wordish=state.stampCategory==='word'||state.stampCategory==='bubble'||['dots','check','twinkle'].includes(variant);const width=tapeOrFrame?48:wordish?30:18;const placed=state.fields.filter(f=>f.kind==='stamp');const candidates=[58,73,85].flatMap(y=>[3,35,67].map(x=>({x,y})));const pos=candidates.find(c=>!placed.some(f=>c.x<f.x+f.w&&c.x+width>f.x&&Math.abs(c.y-f.y)<13))||{x:25,y:73};state.fields.push({kind:'stamp',label:text,text,variant,x:pos.x,y:pos.y,w:width});render();toast('スタンプを追加したよ')}else if(kind==='delete-piece'){state.fields.splice(Number(value),1);render()}else if(kind==='undo-stroke'){if(state.strokes.length){state.strokes.pop();render();toast('ひとつ戻しました')}else toast('消せる線はまだありません')}else if(kind==='filter'){state.filter=value;render()}else if(kind==='view'){state.view=value;render()}else if(kind==='toggle-panel'){state.panelOpen=!state.panelOpen;const scroller=app.querySelector('.editor-scroll');const scrollTop=scroller?.scrollTop||0;render();app.querySelector('.editor-scroll').scrollTop=scrollTop;app.querySelector('.panel-toggle')?.focus()}else if(kind==='add-text'){state.fields.push({label:'テキスト',text:'',x:7,y:Math.min(70,35*state.fields.length),w:80});state.tool='text';render();app.querySelectorAll('[data-field]')[state.fields.length-1]?.focus()}else if(kind==='focus-search'){app.querySelector('#search')?.focus()}else if(kind==='reaction'){state.reactions.has(value)?state.reactions.delete(value):state.reactions.add(value);render()}else if(kind==='emoji'){toast('絵文字キーボードは今後の実装です')}else if(kind==='send'){state.sent=true;state.screen='sent';render()}else if(kind==='create-invite'){state.invite=true;render()}else if(kind==='invalidate'){state.invite=false;render();toast('サンプルリンクを無効化しました')}else if(kind==='unavailable')toast(value);});
render();
})();
