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
n_community|Communities|Cộng đồng
n_hub|Hub|Điểm gom
n_workshop|Workshop|Xưởng
n_market|Sell back|Bán lại
n_impact|Impact|Kết quả
n_demo|Demo|Dùng thử
n_admin|Admin|Quản trị
m_menu|Menu|Menu
m_close|Close menu|Đóng menu
m_lang|Language|Ngôn ngữ
m_dark|Dark mode|Chế độ tối
skip|Skip to content|Bỏ qua, vào nội dung
ft_note|Sample numbers. Saved in your browser only.|Số liệu mẫu. Chỉ lưu trên trình duyệt của bạn.
note_sample|Sample numbers: amounts, prices and traffic are not real. The cafés are not partners yet, and the community areas are examples.|Số liệu mẫu: lượng bã, giá, giao thông chưa phải thật. Các quán chưa là đối tác, khu vực cộng đồng chỉ là ví dụ.
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
st_drop_d|Cafés leave grounds at the hub. Households book a day and we collect.|Quán gửi bã ở điểm gom. Hộ gia đình đặt ngày, chúng tôi đến lấy.
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
err_brand|Pick a café or community from the list.|Hãy chọn một quán hoặc cộng đồng trong danh sách.
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
c_brand|Café or community|Quán hoặc cộng đồng
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
c_th_brand|Source|Nguồn
c_th_kg|Weight|Cân nặng
c_th_grade|Grade|Loại
c_th_when|Received|Nhận lúc
c_th_status|Status|Tình trạng
c_done|Made into products|Đã làm sản phẩm
c_rejected|Rejected|Không đạt

# --- hub ---
hb_title|Hub|Điểm gom
hb_sub|Cafés and households drop grounds here. The workshop picks them up fresh.|Quán và hộ gia đình gửi bã về đây. Xưởng đến lấy khi bã còn tươi.
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
hb_cafes|What each café or community dropped|Mỗi quán hoặc cộng đồng đã gửi
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
# --- demo page ---
d_title|Demo: follow one batch|Dùng thử: đi theo một mẻ bã
d_sub|Watch 4 kg of grounds go from a café to a candle and back to a café. Press the button to run each step. Nothing is saved.|Xem 4 kg bã đi từ quán cà phê đến cây nến rồi quay lại quán. Bấm nút để chạy từng bước. Không có gì được lưu.
d_progress|Demo progress|Tiến độ dùng thử
d_start|Start the demo|Bắt đầu
d_next|Next step|Bước tiếp theo
d_all|Run all steps|Chạy hết các bước
d_reset|Start over|Làm lại
d_1_t|A café hands over grounds|Quán đưa bã đến
d_1_b|{cafe} brings {kg} kg of fresh grounds to the hub. We check how wet, clean and fresh they are.|{cafe} mang {kg} kg bã tươi đến điểm gom. Mình kiểm tra độ ẩm, độ sạch và độ tươi.
d_2_t|The workshop collects|Xưởng đến lấy
d_2_b|The workshop picks up every good batch waiting at the hub.|Xưởng lấy mọi mẻ đạt đang chờ ở điểm gom.
d_3_t|Grounds become products|Bã thành sản phẩm
d_3_b|The clean grounds are dried and made into {product}. Only the best grade can be made into candles.|Bã sạch được sấy và làm thành {product}. Chỉ bã loại tốt nhất mới làm được nến.
d_4_t|Sold back to a café|Bán lại cho quán
d_4_b|{shop} buys {units} of them for its counter. The loop is closed.|{shop} mua {units} cái để bán tại quầy. Vòng tuần hoàn khép kín.
d_5_t|See the result|Xem kết quả
d_5_b|Totals for this one batch.|Tổng kết cho mẻ bã này.
d_r1|Grade {grade}, score {score}. {kg} kg waiting at {hub}.|Loại {grade}, {score} điểm. {kg} kg đang chờ ở {hub}.
d_r2|Collected {kg} kg ({count} batch).|Đã lấy {kg} kg ({count} mẻ).
d_r3|Made {units} {product} from {g} g of dry grounds.|Làm được {units} {product} từ {g} g bã khô.
d_r4|Sold {units} {product} to {cafe} for {v}.|Bán {units} {product} cho {cafe} được {v}.
d_r5|{kg} kg kept out of landfill. About {co2} kg CO2e avoided (sample factor).|Giữ {kg} kg bã khỏi bãi rác. Khoảng {co2} kg CO2e được tránh (hệ số mẫu).
d_s_kg|Grounds saved|Bã được giữ lại
d_s_units|Products made|Sản phẩm làm ra
d_s_rev|Sales|Doanh thu
d_s_co2|CO2e avoided (sample)|CO2e tránh được (mẫu)
d_end|This demo used sample numbers on its own copy of the data. Your real data is untouched.|Bản dùng thử dùng số liệu mẫu trên bản sao riêng. Dữ liệu thật của bạn không bị đổi.
d_try|Try it with your own numbers|Thử với số liệu của bạn
# --- admin page ---
a_title|Admin: products and hubs|Quản trị: sản phẩm và điểm gom
a_sub|Edit how many of each product are in stock, and control the collecting hubs.|Sửa số lượng còn trong kho của từng sản phẩm và điều khiển các điểm gom.
a_pin|Admin passcode|Mật mã quản trị
a_unlock|Unlock|Mở khóa
a_lock|Lock admin|Khóa quản trị
a_wrong|Wrong passcode.|Sai mật mã.
a_https|This needs a secure (https) page.|Cần mở bằng trang bảo mật (https).
a_note|Changes are saved in this browser only and show on the other pages. This lock is a convenience, not real security.|Thay đổi chỉ lưu trong trình duyệt này và hiện ở các trang khác. Khóa này chỉ để tiện, không phải bảo mật thật.
a_stock|in stock|trong kho
a_now|Now|Hiện có
a_save|Save|Lưu
a_saved|Stock saved.|Đã lưu số lượng.
a_hist|Recent changes|Thay đổi gần đây
a_empty|No changes yet.|Chưa có thay đổi.
a_th_when|When|Lúc
a_th_what|What changed|Thay đổi gì
a_th_from|From|Từ
a_th_to|To|Thành
a_prod_h|Product numbers|Số lượng sản phẩm
a_hubs_h|Collecting hubs|Điểm gom
a_hubs_sub|Open or close a hub, set how many kg it can hold, and clear rejected batches. A closed hub takes no new drops, and a hub that is full refuses more.|Mở hoặc đóng điểm gom, đặt sức chứa theo kg và xóa các mẻ bị loại. Điểm gom đóng không nhận thêm bã, điểm gom đầy sẽ từ chối thêm.
a_cap|Capacity (kg)|Sức chứa (kg)
a_stat|{n} batches waiting, {r} rejected|{n} mẻ đang chờ, {r} mẻ bị loại
a_close_btn|Close hub|Đóng điểm gom
a_open_btn|Open hub|Mở điểm gom
a_clear|Clear rejected ({n})|Xóa mẻ bị loại ({n})
a_cleared|Removed {n} rejected batches.|Đã xóa {n} mẻ bị loại.
a_hub_saved|Hub saved.|Đã lưu điểm gom.
a_view_hub|See on Hub page|Xem ở trang Điểm gom
a_w_stock|Stock: {p}|Kho: {p}
a_w_hub|{hub}: {field}|{hub}: {field}
a_f_open|open or closed|mở hay đóng
a_f_capacityKg|capacity (kg)|sức chứa (kg)
a_f_cleared|rejected batches cleared|mẻ bị loại đã xóa
a_v_open|Open|Đang mở
hb_closed|Closed|Đã đóng
err_hub_closed|This hub is closed. Pick another one.|Điểm gom này đang đóng. Hãy chọn điểm khác.
err_hub_full|This hub does not have room for that many kg.|Điểm gom không đủ chỗ cho lượng bã này.
err_hub_cap|Enter a whole number from 1 to 5000.|Nhập số nguyên từ 1 đến 5000.
a_cafe_h|Café tracker: revenue and next collection|Theo dõi quán: doanh thu và lần thu gom tới
a_cafe_sub|What each café has dropped and bought back. The next collection date is the last drop plus the café's own average gap between drops (a week if there is only one drop). Cafés with no drops show their sample weekly amount.|Mỗi quán đã đưa bã bao nhiêu và đã mua lại bao nhiêu. Ngày thu gom tới là lần đưa bã gần nhất cộng khoảng cách trung bình giữa các lần của quán (một tuần nếu mới có một lần). Quán chưa đưa bã hiện lượng mẫu mỗi tuần.
a_cafe_rev|Revenue from cafés|Doanh thu từ các quán
a_cafe_kg|Grounds dropped|Bã đã nhận
a_cafe_due|Due within 7 days or overdue (cafés · expected kg)|Đến hạn trong 7 ngày hoặc trễ (quán · kg dự kiến)
a_th_cafe|Café|Quán
a_th_drops|Drops|Lần đưa
a_th_kgd|Dropped|Đã đưa
a_th_last|Last drop|Lần gần nhất
a_th_next|Next collection|Thu gom tới
a_th_exp|Expected per drop|Dự kiến mỗi lần
a_th_units|Bought|Đã mua
a_th_rev|Revenue|Doanh thu
a_in_days|in {n} days|sau {n} ngày
a_today|today|hôm nay
a_overdue|{n} days overdue|trễ {n} ngày
a_nodrop|No drops yet|Chưa có lần đưa bã
a_est|estimate|ước tính
a_csv|Download CSV|Tải CSV
err_stock_num|Enter a whole number from 0 to 100000.|Nhập số nguyên từ 0 đến 100000.
err_product|Unknown product.|Sản phẩm không có.

# --- communities: households book a collection date ---
cm_title|Communities|Cộng đồng
cm_sub|Live in one of our areas? Pick a date and we come to your door for your coffee grounds.|Ở trong khu của chúng tôi? Chọn ngày, chúng tôi đến tận nhà lấy bã cà phê của bạn.
cm_local|Bookings are saved in this browser only. Nothing is sent to anyone yet.|Lịch đặt chỉ lưu trong trình duyệt này. Chưa gửi cho ai cả.
cm_areas|Our communities|Các cộng đồng
cm_area_note|Areas are examples drawn for this prototype: the streets around each address.|Khu vực chỉ là ví dụ cho bản mẫu: các đường quanh mỗi địa chỉ.
cm_hub|Grounds go to {hub}|Bã được đưa về {hub}
cm_next|Days already booked|Các ngày đã có người đặt
cm_no_rounds|No dates booked yet. Be the first.|Chưa có ngày nào được đặt. Hãy là người đầu tiên.
cm_round|{date}: {n} of {max} households|{date}: {n} trên {max} hộ
cm_book_h|Book a collection day|Đặt ngày đến lấy bã
cm_f_area|Your community|Cộng đồng của bạn
cm_f_name|Your name|Tên của bạn
cm_f_contact|Phone or Zalo number|Số điện thoại hoặc Zalo
cm_f_contact_h|So the collector can call you at the door.|Để người thu gom gọi cho bạn khi đến.
cm_f_where|House, lane or building|Số nhà, hẻm hoặc tòa nhà
cm_f_where_h|For example: lane 12/3, block B.|Ví dụ: hẻm 12/3, khối B.
cm_f_kg|About how many kg|Khoảng bao nhiêu kg
cm_f_kg_h|From 0.1 to 20 kg.|Từ 0,1 đến 20 kg.
cm_f_date|Collection date|Ngày đến lấy
cm_f_date_h|From tomorrow up to 4 weeks ahead.|Từ ngày mai đến 4 tuần tới.
cm_f_note|Note for the collector (optional)|Ghi chú cho người thu gom (không bắt buộc)
cm_spots|{left} of {max} places left on this day.|Ngày này còn {left} trên {max} chỗ.
cm_spots_full|This day is full. Pick another day.|Ngày này đã đầy. Hãy chọn ngày khác.
cm_book|Book this day|Đặt ngày này
cm_booked|Booked for {date}.|Đã đặt ngày {date}.
cm_tips_h|Before we come|Trước khi chúng tôi đến
cm_tip1|Spread the grounds on a tray to dry for a few hours.|Trải bã ra khay cho ráo vài giờ.
cm_tip2|Keep them in a clean box with a lid.|Đựng trong hộp sạch có nắp.
cm_tip3|No milk, sugar, paper or food scraps.|Không lẫn sữa, đường, giấy hay thức ăn.
cm_tip4|Grounds older than a day can grow mold, so book soon after brewing.|Bã để quá một ngày dễ bị mốc, nên hãy đặt ngày sớm sau khi pha.
cm_mine|Your bookings|Lịch bạn đã đặt
cm_mine_none|Nothing booked yet.|Chưa đặt lịch nào.
cm_th_date|Date|Ngày
cm_th_area|Community|Cộng đồng
cm_th_name|Household|Hộ
cm_th_kg|About|Khoảng
cm_th_status|Status|Tình trạng
cm_s_scheduled|Booked|Đã đặt
cm_s_collected|Collected|Đã lấy
cm_s_cancelled|Cancelled|Đã hủy
cm_change|Change date|Đổi ngày
cm_cancel|Cancel|Hủy
cm_moved|Date changed to {date}.|Đã đổi sang ngày {date}.
cm_cancelled|Booking cancelled.|Đã hủy lịch.
hh_t|Not a café? Your street counts too.|Không phải quán? Cả khu phố bạn cũng được.
hh_p|Households near our hubs can book a day, and we collect your coffee grounds from the door.|Hộ gia đình gần điểm gom có thể đặt ngày, chúng tôi đến tận nhà lấy bã cà phê.
hh_s1|Pick your community|Chọn cộng đồng
hh_s2|Choose a date|Chọn ngày
hh_s3|We come to your door|Chúng tôi đến tận nhà
hh_cta|Book a collection day|Đặt ngày đến lấy bã
err_community|Pick a community from the list.|Hãy chọn một cộng đồng trong danh sách.
err_pk_name|Enter your name (2 to 60 characters).|Hãy nhập tên của bạn (2 đến 60 ký tự).
err_pk_contact|Enter a phone number with 8 to 13 digits.|Hãy nhập số điện thoại từ 8 đến 13 chữ số.
err_pk_where|Enter your house, lane or building (3 to 120 characters).|Hãy nhập số nhà, hẻm hoặc tòa nhà (3 đến 120 ký tự).
err_pk_kg|Weight must be from 0.1 to 20 kg.|Cân nặng phải từ 0,1 đến 20 kg.
err_pk_date|Pick a date from tomorrow up to 4 weeks ahead.|Hãy chọn ngày từ ngày mai đến 4 tuần tới.
err_pk_note|The note is too long (140 characters at most).|Ghi chú quá dài (tối đa 140 ký tự).
err_pk_dup|This phone number already has a booking in this community. Change or cancel it first.|Số điện thoại này đã có lịch ở cộng đồng này. Hãy đổi hoặc hủy lịch cũ trước.
err_pk_full|That day is full. Pick another day.|Ngày đó đã đầy. Hãy chọn ngày khác.
err_pk_none|This booking cannot be changed.|Không thể thay đổi lịch này.
err_pk_mismatch|That booking belongs to a different community.|Lịch này thuộc cộng đồng khác.
c_group_cafe|Cafés|Các quán
c_group_com|Communities|Các cộng đồng
c_pickup|From a booked household pick-up (optional)|Từ lịch hộ gia đình đã đặt (không bắt buộc)
c_pickup_h|Fills in the community and weight, and marks the booking collected when you save.|Điền sẵn cộng đồng và cân nặng, và đánh dấu đã lấy khi bạn lưu.
c_pickup_none|None|Không chọn
i_household|From households|Từ hộ gia đình
i_household_h|Picked up in the communities.|Lấy ở các cộng đồng.
a_hh_h|Household pick-ups|Lịch lấy bã của hộ gia đình
a_hh_sub|Households book a day on the Communities page. Collect on that day, then log the batch on the Collect page and pick the booking to mark it collected.|Hộ gia đình đặt ngày ở trang Cộng đồng. Đến lấy đúng ngày, rồi ghi mẻ ở trang Thu bã và chọn lịch đó để đánh dấu đã lấy.
a_hh_n|Households booked|Hộ đã đặt
a_hh_kg|Expected kg in 7 days|Kg dự kiến trong 7 ngày
a_hh_rounds|Collection days in 7 days|Ngày thu gom trong 7 ngày
a_hh_none|No households booked.|Chưa có hộ nào đặt lịch.
a_hh_cancel|Cancel booking|Hủy lịch
a_hh_log|Log a batch on the Collect page|Ghi mẻ ở trang Thu bã
a_th_contact|Contact|Liên hệ
a_th_where|Address|Địa chỉ
a_th_note|Note|Ghi chú
`;

export { RAW };
