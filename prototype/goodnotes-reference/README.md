# 交換日記 画面試作

`index.html` をブラウザーで開く。スマートフォン幅のプレビュー用。すべて仮の画面・データで、実際のアカウント、招待、送信、データ保存は行わない。画面を閉じると入力内容は消える。

日記帳一覧の検索・絞り込み・表紙／リスト切替から、日記帳・順番、テンプレート選択、自由配置ページの編集、プレビュー、受け渡し、閲覧まで試せる。ページ上の入力欄に直接入力し、文字を追加できる。選択ツールでは文字欄やスタンプをドラッグまたは矢印キーで移動・削除できる。ペンは５種類・６色、文字とモチーフ・柄のスタンプは試作のサンプル。消しゴムは最後の線を１本取り消す。写真、コメント、自由絵文字などは表示例。招待画面では仮のリンク作成から途中参加後の順番まで確認できる。

プリクラのデコレーションを参考に、遊び心を残しつつ、ブルー・グリーン・オレンジなども使ったカジュアルな配色に調整した。色や素材は採用確定ではない。

トップバー・下部ナビ・ツールバー・パネル・カード類の「Liquid Glass」表現は、Flutter 本実装では pub.dev の [`liquid_glass_widgets`](https://pub.dev/packages/liquid_glass_widgets) と [`liquid_glass_easy`](https://pub.dev/packages/liquid_glass_easy) を基盤に組む前提。Web プロトタイプでは CSS の `backdrop-filter`、上縁のスペキュラ、淡い色収差、深めの投影を重ねて雰囲気を再現している。詳細は [技術構成の提案](../../docs/technology.md)を参照。

[Mobbin の Goodnotes](https://mobbin.com/apps/goodnotes-ios-3fe1cf71-b957-422e-87fd-1b5d04fa6649/93cd5331-75ba-5932-a1cd-414fc20bd928/screens)の一覧、[Apple Notes](https://mobbin.com/apps/apple-notes-ios-201a63f1-7499-4ebe-b92d-401605aa41bb/1782dd26-1259-4ebf-b402-384a81685971/screens)の検索・一覧、[5 Minute Journal](https://mobbin.com/apps/5-minute-journal-ios-595ba6e4-9f90-4000-ba54-efd4ea1283ff/59e50e27-93e1-47d0-85a6-e6c6736cb8ae/screens)の書くきっかけを示す画面を参考にした。編集ツールの構成は [Goodnotes の公開資料](https://support.goodnotes.com/hc/en-us/articles/13682253498767-Improved-User-Interface)も参考にしている。Mobbin の全画面は閲覧できていない。色や文言、テンプレートは未確定。

2026-11-19 更新：画面構成は保ったまま、タイポグラフィ・スペーシング・セクション見出し・区切り線・カード設計を参考アプリ３つに寄せて調整した。具体的には、Apple Notes 風の UPPER 小見出し＋挿入区切り線、Goodnotes 風の紙らしい表紙陰影、5 Minute Journal 風の暖色トークン（`--ink-strong` / `--muted-warm` / `--shadow-warm-*` / `--radius-*`）を導入している。

2026-11-20 更新：デザインレビューを反映し、日記帳一覧の表示切替、手番の強調、編集パネルの折りたたみ、ページ装飾、ボタンとアクセシビリティを調整した。最終更新日はサンプル表示。編集パネルはタップまたは上方向へのスワイプで閉じられる。
