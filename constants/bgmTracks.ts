// 対戦・ひとりであそぶ で流す BGM の曲名。『月蝕綺譚』公式の楽曲一覧（fanworks の楽曲セクション、
// kitan-lore の list_tracks）の曲題と位置づけをそのまま写した。mp3 のファイル名で引く。
// 曲を足すときは、推測で書かずに公式の一覧から写すこと。

export interface BgmTrack {
  /** 正式な曲題 */
  title: string;
  /** 位置づけ（だれのテーマか） */
  role: string;
}

const TRACKS: Record<string, BgmTrack> = {
  'kitan_maintheme.mp3': { title: '月蝕綺譚', role: 'タイトル曲' },
  'tsuki_ga_kakureru_made_wa.mp3': { title: '月が隠れるまでは', role: 'エンディング曲' },
  'muyou_no_hi.mp3': { title: '無用の火', role: '咲耶のテーマソング' },
  'akarui_kakari.mp3': { title: 'あかるい係', role: '於兎のテーマソング' },
  'freehand.mp3': { title: 'Freehand', role: 'ネムのテーマソング' },
  'kizutsuita_shika.mp3': { title: '傷ついた鹿', role: '紫苑のテーマソング' },
  'hand_me_down.mp3': { title: 'Hand-Me-Down', role: '宇迦のテーマソング' },
  'nightcap.mp3': { title: 'Nightcap', role: 'イズナのテーマソング' },
  'rinkaku.mp3': { title: '輪郭', role: 'エマのテーマソング' },
  'yohaku_no_tsuzuki.mp3': { title: '余白の続き', role: '栞のテーマソング' },
  'ichiban_hayai_gogo.mp3': { title: 'いちばん はやい 午後', role: 'タルトのテーマソング' },
  'punto_di_fuga.mp3': { title: 'Punto di fuga', role: 'サスラのテーマソング A面' },
  'matsuge_no_kyori.mp3': { title: 'まつげの距離', role: 'サスラのテーマソング B面' },
  'yuki_no_onryou.mp3': { title: '雪の音量', role: 'アウンのテーマソング' },
  'nigai_niwa.mp3': { title: '苦い庭', role: '酉花のテーマソング' },
  'pilot_light.mp3': { title: 'Pilot Light', role: 'シンラのテーマソング' }
};

/** BGM の URL から曲名を引く。一覧に無い曲は null（表示しない） */
export const bgmTrackOf = (src: string): BgmTrack | null => TRACKS[src.split('/').pop() ?? ''] ?? null;
