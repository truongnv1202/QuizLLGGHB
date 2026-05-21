export type SeedQuestionData = {
  level: number;
  content: string;
  explanation: string | null;
  imageUrl: string | null;
  answers: Array<{ content: string; isCorrect: boolean }>;
};

export const defaultQuestions = [
  {
    "level": 1,
    "content": "Theo Luật Tham gia lực lượng gìn giữ hòa bình Liên hợp quốc, ngày truyền thống của Lực lượng Việt Nam tham gia hoạt động GGHB LHQ là ngày nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "27/5",
        "isCorrect": true
      },
      {
        "content": "29/5",
        "isCorrect": false
      },
      {
        "content": "20/9",
        "isCorrect": false
      },
      {
        "content": "24/10",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 1,
    "content": "Luật Tham gia lực lượng gìn giữ hòa bình của Liên hợp quốc được thông qua tại Kỳ họp thứ mấy của Quốc hội khóa XV?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Kỳ họp thứ 6",
        "isCorrect": false
      },
      {
        "content": "Kỳ họp thứ 7",
        "isCorrect": false
      },
      {
        "content": "Kỳ họp thứ 8",
        "isCorrect": false
      },
      {
        "content": "Kỳ họp thứ 9",
        "isCorrect": true
      }
    ]
  },
  {
    "level": 1,
    "content": "Luật Tham gia lực lượng gìn giữ hòa bình của Liên hợp quốc có hiệu lực từ khi nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "01/07/2025",
        "isCorrect": false
      },
      {
        "content": "01/01/2026",
        "isCorrect": true
      },
      {
        "content": "01/07/2026",
        "isCorrect": false
      },
      {
        "content": "01/01/2027",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 1,
    "content": "Việt Nam cử sĩ quan tham gia hoạt động GGHB LHQ vào năm nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "2013",
        "isCorrect": false
      },
      {
        "content": "2014",
        "isCorrect": true
      },
      {
        "content": "2015",
        "isCorrect": false
      },
      {
        "content": "2016",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 1,
    "content": "Bộ Công an cử sĩ quan tham gia hoạt động GGHB LHQ lần đầu tiên vào năm nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "2020",
        "isCorrect": false
      },
      {
        "content": "2021",
        "isCorrect": false
      },
      {
        "content": "2022",
        "isCorrect": true
      },
      {
        "content": "2023",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 2,
    "content": "Đến nay, Bộ Công an đã triển khai sĩ quan tham gia hoạt động GGHB ở mấy phái bộ?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "1",
        "isCorrect": false
      },
      {
        "content": "2",
        "isCorrect": false
      },
      {
        "content": "3",
        "isCorrect": true
      },
      {
        "content": "4",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 2,
    "content": "Đến nay, Bộ Công an đã triển khai bao nhiêu Tổ Công tác?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "5",
        "isCorrect": false
      },
      {
        "content": "6",
        "isCorrect": false
      },
      {
        "content": "7",
        "isCorrect": false
      },
      {
        "content": "8",
        "isCorrect": true
      }
    ]
  },
  {
    "level": 2,
    "content": "Đơn vị Cảnh sát GGHB số 1 ra mắt vào ngày/tháng/năm nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "08/01/2024",
        "isCorrect": true
      },
      {
        "content": "11/01/2024",
        "isCorrect": false
      },
      {
        "content": "03/02/2024",
        "isCorrect": false
      },
      {
        "content": "13/05/2024",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 2,
    "content": "Đơn vị Cảnh sát GGHB số 1 được nâng lên Cấp độ 2 sau kỳ kiểm tra, đánh giá nào của LHQ?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "AOC (Assessment of Capacity)",
        "isCorrect": false
      },
      {
        "content": "PDV (Pre-Deployment Visit)",
        "isCorrect": false
      },
      {
        "content": "AAV (Assessment and Advisory)",
        "isCorrect": true
      },
      {
        "content": "VV (Verification Visit)",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 2,
    "content": "Nhiệm vụ chính của Đơn vị Cảnh sát GGHB của LHQ gồm những gì?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Bảo vệ dân thường khỏi những đe đọa vũ lực",
        "isCorrect": false
      },
      {
        "content": "Hỗ trợ các hoạt động của cảnh sát LHQ vượt quá năng lực sĩ quan cá nhân và hỗ trợ cảnh sát nước sở tại",
        "isCorrect": false
      },
      {
        "content": "Bảo vệ nhân viên và tài sản của LHQ",
        "isCorrect": false
      },
      {
        "content": "Cả 3 đáp án trên",
        "isCorrect": true
      }
    ]
  },
  {
    "level": 2,
    "content": "Đơn vị Cảnh sát GGHB số 1 đăng ký với LHQ biên chế bao nhiêu thành viên chính thức?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "140",
        "isCorrect": false
      },
      {
        "content": "160",
        "isCorrect": true
      },
      {
        "content": "180",
        "isCorrect": false
      },
      {
        "content": "200",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 3,
    "content": "Đơn vị Cảnh sát GGHB số 1 hiện nay có bao nhiêu cán bộ Nữ?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "40",
        "isCorrect": false
      },
      {
        "content": "38",
        "isCorrect": false
      },
      {
        "content": "34",
        "isCorrect": true
      },
      {
        "content": "36",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 3,
    "content": "Cơ cấu tổ chức của Đơn vị Cảnh sát GGHB số 1 như thế nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "1 ban, 5 đội",
        "isCorrect": false
      },
      {
        "content": "2 ban, 4 đội",
        "isCorrect": true
      },
      {
        "content": "3 ban, 3 đội",
        "isCorrect": false
      },
      {
        "content": "6 đội",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 3,
    "content": "Theo Quy định của Liên hợp quốc, yêu cầu về độ tuổi, kinh nghiệm công tác khi tham gia ứng tuyển sĩ quan cá nhân GGHB LHQ như thế nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Từ 25 đến dưới 55 tuổi",
        "isCorrect": false
      },
      {
        "content": "Trên 5 năm kinh nghiệm công tác trong lực lượng",
        "isCorrect": false
      },
      {
        "content": "Từ 25 đến 60 tuổi",
        "isCorrect": false
      },
      {
        "content": "Cả đáp án A và B",
        "isCorrect": true
      }
    ]
  },
  {
    "level": 3,
    "content": "Đơn vị Cảnh sát GGHB của LHQ là?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Đơn vị bán vũ trang",
        "isCorrect": false
      },
      {
        "content": "Đơn vị vũ trang",
        "isCorrect": true
      }
    ]
  },
  {
    "level": 3,
    "content": "Văn phòng Thường trực Bộ Công an về GGHB LHQ được thành lập ngày nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "15/6/2021",
        "isCorrect": true
      },
      {
        "content": "30/10/2020",
        "isCorrect": false
      },
      {
        "content": "06/9/2013",
        "isCorrect": false
      },
      {
        "content": "17/11/2012",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 3,
    "content": "Phái bộ UNISFA hoạt động tại khu vực nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Dải Gaza",
        "isCorrect": false
      },
      {
        "content": "Khu vực Abyei",
        "isCorrect": true
      },
      {
        "content": "Cộng hòa Trung phi",
        "isCorrect": false
      },
      {
        "content": "Cộng hòa Nam Xu-đăng",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 3,
    "content": "Phái bộ MINUSCA hoạt động tại quốc gia nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Congo",
        "isCorrect": false
      },
      {
        "content": "Đảo Síp",
        "isCorrect": false
      },
      {
        "content": "Cộng hòaTrung Phi",
        "isCorrect": true
      },
      {
        "content": "Somalia",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 3,
    "content": "Phái bộ UNMISS hoạt động tại quốc gia nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Congo",
        "isCorrect": false
      },
      {
        "content": "Somalia",
        "isCorrect": false
      },
      {
        "content": "Cộng hòaTrung Phi",
        "isCorrect": false
      },
      {
        "content": "Nam Xu-đăng",
        "isCorrect": true
      }
    ]
  },
  {
    "level": 4,
    "content": "Bộ công an Việt Nam có sĩ quan làm việc ở bộ phận nào của Trụ sở Liên hợp quốc ở New York?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Phòng Cảnh sát Liên hợp quốc (PD)",
        "isCorrect": true
      },
      {
        "content": "Phòng Huấn luyện tích hợp (ITS)",
        "isCorrect": false
      },
      {
        "content": "Bộ phận Thường trực hỗ trợ năng lực Cảnh sát (SPC)",
        "isCorrect": false
      },
      {
        "content": "Bộ phận Cải cách lĩnh vực (SSR)",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 4,
    "content": "Tổ công tác đầu tiên của Bộ Công an đi phái bộ nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "UNISFA",
        "isCorrect": false
      },
      {
        "content": "MINUSCA",
        "isCorrect": false
      },
      {
        "content": "UNMISS",
        "isCorrect": true
      },
      {
        "content": "MONUSCO",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 4,
    "content": "FPU là viết tắt của cụm từ nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Force Police Unit",
        "isCorrect": false
      },
      {
        "content": "Formed Police Unit",
        "isCorrect": true
      },
      {
        "content": "Federal Police Unit",
        "isCorrect": false
      },
      {
        "content": "Field Protection Unit",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 4,
    "content": "Đơn vị Cảnh sát GGHB số 1 của Bộ Công an có tên viết tắt là gì?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "VNFPU1",
        "isCorrect": true
      },
      {
        "content": "VNIPO1",
        "isCorrect": false
      },
      {
        "content": "VNPUN1",
        "isCorrect": false
      },
      {
        "content": "VNPPS1",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 4,
    "content": "Hiện nay VNFPU1 đã đạt cấp độ mấy?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Cấp 1",
        "isCorrect": false
      },
      {
        "content": "Cấp 2",
        "isCorrect": false
      },
      {
        "content": "Cấp 3",
        "isCorrect": true
      },
      {
        "content": "Cấp 4",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 4,
    "content": "FPU có nhiệm vụ bảo vệ nhân viên và tài sản của tổ chức nào (tên viết tắt Tiếng Anh)?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "ASEAN",
        "isCorrect": false
      },
      {
        "content": "NATO",
        "isCorrect": false
      },
      {
        "content": "UN",
        "isCorrect": true
      },
      {
        "content": "Interpol",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 4,
    "content": "Thành viên Đơn vị Cảnh sát GGHB (FPU) cần tối thiểu bao nhiêu năm công tác trong ngành Công an?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Tối thiểu 2 năm.",
        "isCorrect": true
      },
      {
        "content": "Tối thiểu 3 năm",
        "isCorrect": false
      },
      {
        "content": "Tối thiểu 04 năm",
        "isCorrect": false
      },
      {
        "content": "Tối thiểu 05 năm",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 4,
    "content": "Tham gia sĩ quan cá nhân (IPO) cần có Giấy phép lái xe hạng gì?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Hạng A",
        "isCorrect": false
      },
      {
        "content": "Hạng B",
        "isCorrect": true
      },
      {
        "content": "Hạng C",
        "isCorrect": false
      },
      {
        "content": "Hạng D",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 4,
    "content": "Tổ chức quốc tế phối hợp với Bộ Công an trong đào tạo, huấn luyện về lĩnh vực GGHB LHQ là tổ chức nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "WTO",
        "isCorrect": false
      },
      {
        "content": "UNESCO",
        "isCorrect": false
      },
      {
        "content": "UN Women",
        "isCorrect": true
      },
      {
        "content": "WHO",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Tham gia GGHB giúp nâng cao điều gì của Việt Nam?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Vị thế quốc tế",
        "isCorrect": false
      },
      {
        "content": "Uy tín quốc tế",
        "isCorrect": false
      },
      {
        "content": "Năng lực làm việc độc lập trong môi trường quốc tế",
        "isCorrect": false
      },
      {
        "content": "Cả 3 đáp án trên",
        "isCorrect": true
      }
    ]
  },
  {
    "level": 5,
    "content": "Bộ Công an hiện có bao nhiêu sĩ quan được công nhận là giảng viên LHQ?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "5",
        "isCorrect": false
      },
      {
        "content": "6",
        "isCorrect": false
      },
      {
        "content": "8",
        "isCorrect": true
      },
      {
        "content": "10",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Trình độ ngoại ngữ (Tiếng Anh) tối thiểu của sĩ quan cá nhân (IPO) là gì?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Trình độ B1 châu Âu hoặc tương đương.",
        "isCorrect": true
      },
      {
        "content": "IELTS 8.0",
        "isCorrect": false
      },
      {
        "content": "Trình độ C1 hoặc tương đương",
        "isCorrect": false
      },
      {
        "content": "Giao tiếp cơ bản",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Thành viên Đơn vị Cảnh sát GGHB (FPU) cần có kỹ năng gì về vũ khí?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Tháo lắp, bảo quản, vận hành và sử dụng vũ khí",
        "isCorrect": true
      },
      {
        "content": "Tháo lắp, sử dụng vũ khí",
        "isCorrect": false
      },
      {
        "content": "Hiểu cấu tạo, cách dùng vũ khí an toàn",
        "isCorrect": false
      },
      {
        "content": "Thao tác sử dụng nhanh, kiểm tra đạt kết quả tuyệt đối",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Tham gia sĩ quan cá nhân (IPO) cần tối thiểu bao nhiêu năm kinh nghiệm công tác?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "2 năm",
        "isCorrect": false
      },
      {
        "content": "3 năm",
        "isCorrect": false
      },
      {
        "content": "5 năm",
        "isCorrect": true
      },
      {
        "content": "7 năm",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Lực lượng GGHB của Bộ Công an thể hiện phẩm chất gì của người chiến sĩ CAND Việt Nam?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Bản lĩnh, chuyên nghiệp, trách nhiệm và nhân văn",
        "isCorrect": true
      },
      {
        "content": "Sẵn sàng hội nhập quốc tế",
        "isCorrect": false
      },
      {
        "content": "Yêu chuộng hòa bình",
        "isCorrect": false
      },
      {
        "content": "Giỏi chuyên môn và đối ngoại quốc tế",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Sĩ quan CAND Việt Nam tại phái bộ được đánh giá như thế nào?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Thiếu kinh nghiệm",
        "isCorrect": false
      },
      {
        "content": "Khó hòa nhập",
        "isCorrect": false
      },
      {
        "content": "Chuyên nghiệp, trách nhiệm",
        "isCorrect": true
      },
      {
        "content": "Hoàn thành cơ bản các nhiệm vụ",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Để tham gia hoạt động GGHB LHQ, sĩ quan cá nhân phải trải qua kỳ thi sát hạch nào sau đây?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "AOC (Assessment of Capacity)",
        "isCorrect": false
      },
      {
        "content": "AAV (Assessment and Advisory)",
        "isCorrect": false
      },
      {
        "content": "AMS (Assessment for Mission Services)",
        "isCorrect": true
      },
      {
        "content": "CBI (Competency-Based Interview)",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Theo quy định của LHQ, tỉ lệ thành viên Nữ tối thiếu trong Đơn vị Cảnh sát GGHB (FPU) là bao nhiêu?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "10%",
        "isCorrect": false
      },
      {
        "content": "20%",
        "isCorrect": true
      },
      {
        "content": "30%",
        "isCorrect": false
      },
      {
        "content": "35%",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Hiện nay, có bao nhiêu phái bộ GGHB của LHQ?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "9",
        "isCorrect": false
      },
      {
        "content": "10",
        "isCorrect": false
      },
      {
        "content": "11",
        "isCorrect": true
      },
      {
        "content": "12",
        "isCorrect": false
      }
    ]
  },
  {
    "level": 5,
    "content": "Có những hình thức nào để tham gia lực lượng Cảnh sát GGHB?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Sĩ quan cá nhân (IPO)",
        "isCorrect": false
      },
      {
        "content": "Đội chuyên gia (SPT)",
        "isCorrect": false
      },
      {
        "content": "Đội chuyên gia (SPT) và Đơn vị Cảnh sát gìn giữ hòa bình (FPU)",
        "isCorrect": false
      },
      {
        "content": "Sĩ quan cá nhân (IPO) và Đơn vị Cảnh sát gìn giữ hòa bình (FPU)",
        "isCorrect": true
      }
    ]
  },
  {
    "level": 5,
    "content": "Phần thưởng cao quý của LHQ trao tặng cho các cá nhân, đơn vị tham gia hoạt động GGHB?",
    "explanation": null,
    "imageUrl": null,
    "answers": [
      {
        "content": "Huy hiệu",
        "isCorrect": false
      },
      {
        "content": "Phù hiệu",
        "isCorrect": false
      },
      {
        "content": "Huy chương",
        "isCorrect": true
      },
      {
        "content": "Quà tặng",
        "isCorrect": false
      }
    ]
  }
] satisfies SeedQuestionData[];
