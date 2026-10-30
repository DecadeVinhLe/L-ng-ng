/**
 * One string per line: key|English|Vietnamese
 * Use {name} for values filled in by t(). Never put a "|" inside a string.
 * A missing Vietnamese string falls back to English, so always add both.
 * Vietnamese is kept short and plain on purpose: everyday words, no jargon.
 */
const RAW = `
# --- navigation and shell ---
n_home|Home|Trang chủ
n_collect|Collect|Thu bã
n_hub|Hub|Điểm gom
n_workshop|Workshop|Xưởng
n_market|Sell back|Bán lại
n_impact|Impact|Kết quả
m_menu|Menu|Menu
m_close|Close menu|Đóng menu
m_lang|Language|Ngôn ngữ
m_dark|Dark mode|Chế độ tối
skip|Skip to content|Bỏ qua, vào nội dung
ft_blurb|Coffee grounds get a second life around Bạch Đằng and Lê Quang Định.|Bã cà phê có đời mới quanh Bạch Đằng và Lê Quang Định.
ft_note|Sample numbers. Saved in your browser only.|Số liệu mẫu. Chỉ lưu trên trình duyệt của bạn.
note_sample|Sample numbers: amounts, prices and traffic are not real. The cafés are not partners yet.|Số liệu mẫu: lượng bã, giá, giao thông chưa phải thật. Các quán chưa là đối tác.
min|min|phút
kg_wk|kg a week (sample)|kg mỗi tuần (mẫu)
k_roaster|Roastery|Nhà rang
k_cafe|Café|Quán cà phê

# --- home ---
h_t|Coffee grounds, fresh again.|Bã cà phê, thơm lại.
h_p|Spent grounds in, handmade goods out.|Bã cà phê vào, đồ thủ công ra.
h_cta|Log grounds|Ghi nhận bã
h_cta2|See results|Xem kết quả
h_eyebrow|Bạch Đằng · Lê Quang Định · HCMC|Bạch Đằng · Lê Quang Định · TP.HCM
map_alt|Google map of the cafés, collection points and workshop|Bản đồ Google của các quán, điểm gom và xưởng
map_open|Open all in Google Maps|Mở trên Google Maps
map_note|Map: Google Maps. Pins show real addresses. Dashed blue lines run from collection points to the workshop.|Bản đồ: Google Maps. Ghim ở đúng địa chỉ thật. Nét đứt xanh nối điểm gom với xưởng.
leg_cafe|Café|Quán
leg_hub|Collection point|Điểm gom
leg_ws|Workshop|Xưởng
kg_short|kg/week|kg/tuần
fig_fruit|Cherry|Quả
fig_bean|Bean|Hạt
fig_ground|Grounds|Bã
fig_item|Product|Sản phẩm
story_t|Why we do this|Vì sao chúng tôi làm
story_p|Every week, cafés bin kilos of grounds. We give them a second life.|Mỗi tuần, quán đổ đi hàng ký bã. Chúng tôi cho bã một đời sống mới.
f1_t|Cafés|Quán
f1_d|Drop grounds at the hub. No sorting, no hauling.|Gửi bã ở điểm gom, không phải tự chở xa.
f2_t|Hub|Điểm gom
f2_d|Holds and checks every batch.|Giữ bã và kiểm tra từng mẻ.
f3_t|Workshop|Xưởng
f3_d|Picks up fresh grounds and makes the products.|Đến lấy bã tươi và làm sản phẩm.
prod_t|What we sell|Sản phẩm của Lắng
prod_sub|Made from café grounds, sold back to cafés and to you.|Làm từ bã cà phê, bán cho quán và cho bạn.
price_note|Sample prices, in đồng.|Giá mẫu, tính bằng đồng.
cafes_t|Cafés near you|Quán quanh bạn
cafes_sub|Coffee shops around our three addresses.|Các quán quanh ba địa chỉ của chúng tôi.
z_bd|Bạch Đằng|Khu Bạch Đằng
z_lqd|Lê Quang Định|Khu Lê Quang Định
open_maps|Open in Maps|Mở bản đồ
photo_note|Photos from Unsplash, not of the cafés.|Ảnh từ Unsplash, không phải ảnh của quán.
steps_t|How it works|Cách làm
st_drop|Drop-off|Gửi bã
st_drop_d|Cafés leave grounds at the hub.|Quán gửi bã ở điểm gom.
st_check|Check|Kiểm tra
st_check_d|Grade each batch for mold, water and mix-ins.|Chấm loại từng mẻ: nấm mốc, nước, tạp chất.
st_pickup|Pick-up|Lấy bã
st_pickup_d|The workshop collects fresh batches.|Xưởng đến lấy các mẻ còn tươi.
st_craft|Craft|Làm sản phẩm
st_craft_d|Dry the grounds and make sachets.|Sấy bã và làm túi thơm.
st_sell|Sell back|Bán lại
st_sell_d|Sell the products to the cafés.|Bán lại cho các quán.
stat_collected|Grounds collected|Bã đã thu
stat_units|Products made|Sản phẩm đã làm
stat_circ|Back to cafés|Quay về quán
stat_revenue|Sales|Doanh thu

# --- grades, issues, errors ---
g_A|Grade A|Loại A
g_B|Grade B|Loại B
g_C|Grade C|Loại C
g_reject|Rejected|Không đạt
i_mold|Visible mold. Reject this batch.|Có nấm mốc. Loại mẻ này.
i_contaminated|Too much milk, sugar or paper mixed in.|Lẫn nhiều sữa, đường hoặc giấy.
i_too_wet|Too wet. Dry it longer.|Quá ướt. Cần sấy lâu hơn.
i_too_dry|Very dry. Was it left out for days?|Rất khô. Có để ngoài nhiều ngày không?
i_stale|Older than 24 hours. Mold risk is higher.|Quá 24 giờ. Dễ bị mốc hơn.
i_ph_off|pH should be between 4.5 and 6.5.|pH nên từ 4,5 đến 6,5.
err_number|Enter a number in every box.|Hãy nhập số vào mọi ô.
err_percent|Percent must be from 0 to 100.|Phần trăm phải từ 0 đến 100.
err_range|Hours cannot be negative. pH must be 0 to 14.|Giờ không được âm. pH phải từ 0 đến 14.
err_brand|Pick a café from the list.|Hãy chọn một quán trong danh sách.
err_kg|Weight must be above 0 and at most 1000 kg.|Cân nặng phải lớn hơn 0 và tối đa 1000 kg.
err_hub|Pick a hub from the list.|Hãy chọn một điểm gom.
err_pickup|The workshop has not collected this batch yet.|Xưởng chưa lấy mẻ này.
err_nothing|Nothing to pick up here.|Không có bã để lấy.
err_batch|Batch not found.|Không tìm thấy mẻ này.
err_processed|This batch is already made into products.|Mẻ này đã làm thành sản phẩm.
err_grade|This batch is not good enough for that product.|Mẻ này chưa đủ tốt cho sản phẩm đó.
err_units|Enter a whole number, 1 or more.|Hãy nhập số nguyên từ 1 trở lên.
err_shop|Pick a café to sell to.|Hãy chọn quán để bán.
err_stock|Not enough in stock.|Trong kho không đủ hàng.
err_form|Pick places, a time and a weight above 0.|Hãy chọn nơi đi, nơi đến, giờ và cân nặng lớn hơn 0.

# --- collect ---
c_title|Collect grounds|Thu bã cà phê
c_sub|Log grounds dropped at a hub. We grade each batch before the workshop collects it.|Ghi nhận bã gửi ở điểm gom. Mỗi mẻ được chấm loại trước khi xưởng lấy.
c_hub|Drop at hub|Gửi tại điểm gom
c_at_hub|At the hub|Ở điểm gom
c_picked|Picked up|Xưởng đã lấy
c_brand|Café|Quán cà phê
c_kg|Weight (kg, wet)|Cân nặng (kg, ướt)
c_kg_h|Up to 1000 kg per batch.|Tối đa 1000 kg mỗi mẻ.
c_moist|Water (%)|Độ ẩm (%)
c_moist_h|Fresh grounds are about 50 to 65.|Bã mới thường từ 50 đến 65.
c_contam|Mix-ins (%)|Tạp chất (%)
c_contam_h|Milk, sugar, paper, plastic.|Sữa, đường, giấy, nhựa.
c_age|Age (hours)|Đã để bao lâu (giờ)
c_ph|pH|pH
c_mold|I can see mold|Tôi thấy có nấm mốc
c_log|Save batch|Lưu mẻ
c_preview|Result|Kết quả
c_clean|No problems found.|Không có vấn đề.
c_usable|Can make:|Có thể làm:
c_none|Nothing can be made from this batch.|Mẻ này không làm được gì.
c_logged|Batch saved.|Đã lưu mẻ.
c_batches|Your batches|Các mẻ đã thu
c_brands|Cafés|Các quán
c_empty|No batches yet. Save your first one above.|Chưa có mẻ nào. Hãy lưu mẻ đầu tiên ở trên.
c_th_brand|Café|Quán
c_th_kg|Weight|Cân nặng
c_th_grade|Grade|Loại
c_th_when|Received|Nhận lúc
c_th_status|Status|Tình trạng
c_done|Made into products|Đã làm sản phẩm
c_rejected|Rejected|Không đạt

# --- hub ---
hb_title|Hub|Điểm gom
hb_sub|Cafés drop grounds here. The workshop picks them up fresh.|Quán gửi bã về đây. Xưởng đến lấy khi bã còn tươi.
hb_waiting|Waiting at the hubs|Bã đang chờ ở điểm gom
hb_cap|{kg} of {cap} kg|{kg} trên {cap} kg
hb_none|Nothing waiting. Log a drop-off on the Collect page.|Chưa có bã. Hãy ghi nhận một lần gửi ở trang Thu bã.
hb_pickup|Workshop pick-up|Xưởng lấy bã
hb_picked|Picked up {n} batches ({kg} kg).|Đã lấy {n} mẻ ({kg} kg).
hb_th_wait|At the hub|Đã chờ
hb_hours|{h} h|{h} giờ
hb_ok|fresh|còn tươi
hb_soon|pick up today|cần lấy hôm nay
hb_reject|rejected, not collected|không đạt, không lấy
hb_cafes|What each café dropped|Mỗi quán đã gửi
hb_cafes_none|No drop-offs yet.|Chưa có lần gửi nào.
hb_th_drops|Drop-offs|Lần gửi

# --- workshop ---
w_title|Workshop|Xưởng
w_sub|Dry the grounds and make odor-absorbing products.|Sấy bã và làm sản phẩm khử mùi.
w_go_hub|Go to Hub|Đến trang Điểm gom
w_none|No grounds at the workshop yet. Pick some up at the hub first.|Xưởng chưa có bã. Hãy lấy bã ở điểm gom trước.
w_pick|Batch|Mẻ bã
w_product|Product|Sản phẩm
w_batch_grade|Batch grade|Loại của mẻ
w_dry|{wet} kg wet makes about {kg} kg dry.|{wet} kg bã ướt cho khoảng {kg} kg bã khô.
w_units|Makes about {n} x {name}.|Làm được khoảng {n} x {name}.
w_make|Make products|Làm sản phẩm
w_made|Added to stock.|Đã thêm vào kho.
w_stock|In stock|Trong kho
p_fridge-sachet|Fridge sachet|Túi khử mùi tủ lạnh
p_fridge-sachet_d|Dry grounds in a small cotton bag for fridge smells.|Bã khô trong túi vải nhỏ, hút mùi tủ lạnh.
p_shoe-deodorizer|Shoe deodorizer|Túi khử mùi giày
p_shoe-deodorizer_d|A bigger bag for shoes and gym bags.|Túi to hơn cho giày và túi thể thao.
p_car-sachet|Car sachet|Túi thơm cho xe
p_car-sachet_d|Hangs in the car and takes away stale smells.|Treo trong xe, giúp hết mùi hôi bí.
p_scrub-soap|Coffee scrub soap|Xà phòng cà phê
p_scrub-soap_d|Handmade soap with fine grounds as a soft scrub.|Xà phòng thủ công, bã mịn tẩy da nhẹ.
p_candle|Coffee candle|Nến cà phê
p_candle_d|A poured candle with dried grounds. Needs the cleanest grounds.|Nến rót có bã khô. Cần bã sạch nhất.

# --- market ---
m_title|Sell back to cafés|Bán lại cho quán
m_sub|Close the loop: sell the products to coffee shops.|Khép vòng: bán sản phẩm cho các quán.
m_shop|Café|Quán cà phê
m_shop_h|A star marks a café that gave us grounds.|Dấu sao là quán đã cho bã.
m_product|Product|Sản phẩm
m_units|Quantity|Số lượng
m_sell|Save sale|Lưu đơn bán
m_sold|Sale saved.|Đã lưu đơn bán.
m_total|Total: {v}|Tổng: {v}
m_left|left|còn
m_supplier|gave grounds|đã cho bã
m_ledger|Sales|Các đơn đã bán
m_empty|No sales yet.|Chưa có đơn nào.
m_th_shop|Café|Quán
m_th_product|Product|Sản phẩm
m_th_units|Qty|SL
m_th_rev|Revenue|Doanh thu
m_th_when|When|Lúc

# --- impact ---
i_title|Impact|Kết quả
i_sub|How much has gone all the way round.|Bao nhiêu đã đi trọn một vòng.
i_note|CO₂e uses a made-up factor of 0.25 kg per kg of grounds. It is an example, not a measurement.|CO₂e dùng hệ số tự đặt 0,25 kg cho mỗi kg bã. Chỉ là ví dụ, không phải số đo thật.
i_circ|Back to cafés|Quay về quán
i_circ_p|{back} of {made} products went back to a café that gave grounds ({pct}%).|{back} trên {made} sản phẩm đã về lại quán cho bã ({pct}%).
i_rejected|Rejected grounds|Bã bị loại
i_rejected_h|Failed the check.|Không qua kiểm tra.
i_diverted|Grounds made into products|Bã đã làm sản phẩm
i_sold|Products sold|Sản phẩm đã bán
i_cost|Cost of goods|Giá vốn
i_cost_h|Materials and work for sold items.|Vật liệu và công cho hàng đã bán.
i_co2|CO₂e avoided (example)|CO₂e tránh được (ví dụ)
i_co2_h|Grounds kept out of landfill.|Bã không bị đem chôn.
`;

export { RAW };
