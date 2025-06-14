export interface Idiom {
  id: string;
  idiom: string;
  pinyin: string;
  meaning: string;
  origin: string;
  example: string;
  similar: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const idioms: Idiom[] = [
  {
    id: '1',
    idiom: '画龙点睛',
    pinyin: 'huà lóng diǎn jīng',
    meaning: '原形容梁代画家张僧繇作画的神妙。后多比喻写文章或讲话时，在关键处用几句话点明实质，使内容生动有力。',
    origin: '唐·张彦远《历代名画记·张僧繇》："金陵安乐寺四白龙不点眼睛，每云：\'点睛即飞去。\'人以为妄诞，固请点之。须臾，雷电破壁，两龙乘云腾去上天，二龙未点眼者见在。"',
    example: '这篇文章的结尾很精彩，真是画龙点睛之笔。',
    similar: ['锦上添花', '妙笔生花'],
    category: '艺术创作',
    difficulty: 'medium'
  },
  {
    id: '2',
    idiom: '温故知新',
    pinyin: 'wēn gù zhī xīn',
    meaning: '温习旧的知识，得到新的理解和体会。也指回忆过去，能更好地认识现在。',
    origin: '《论语·为政》："子曰：\'温故而知新，可以为师矣。\'"',
    example: '学习要温故知新，不断加深对知识的理解。',
    similar: ['学而时习之', '举一反三'],
    category: '学习教育',
    difficulty: 'easy'
  },
  {
    id: '3',
    idiom: '鸿鹄之志',
    pinyin: 'hóng hú zhī zhì',
    meaning: '鸿鹄：天鹅，比喻志向远大的人；志：志向。比喻远大志向。',
    origin: '《史记·陈涉世家》："嗟乎！燕雀安知鸿鹄之志哉！"',
    example: '年轻人要有鸿鹄之志，不能安于现状。',
    similar: ['志存高远', '胸怀大志'],
    category: '志向理想',
    difficulty: 'medium'
  },
  {
    id: '4',
    idiom: '水滴石穿',
    pinyin: 'shuǐ dī shí chuān',
    meaning: '水不停地滴，石头也能被滴穿。比喻只要有恒心，不断努力，事情就一定能成功。',
    origin: '《汉书·枚乘传》："泰山之霤穿石，单极之绠断干。水非石之钻，索非木之锯，渐靡使之然也。"',
    example: '学习如水滴石穿，需要持之以恒的努力。',
    similar: ['滴水穿石', '铁杵磨针'],
    category: '坚持努力',
    difficulty: 'easy'
  },
  {
    id: '5',
    idiom: '妙手回春',
    pinyin: 'miào shǒu huí chūn',
    meaning: '回春：使春天重返，比喻将快死的人救活。指医生医术高明。',
    origin: '清·李宝嘉《官场现形记》第二十回："但是药铺门里门外，足足挂着二三十块匾额：什么\'功同良相\'，什么\'妙手回春\'……"',
    example: '这位医生妙手回春，救活了许多病人。',
    similar: ['起死回生', '华佗再世'],
    category: '医术技艺',
    difficulty: 'medium'
  },
];